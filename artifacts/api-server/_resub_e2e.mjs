import crypto from "crypto";
import { createRequire } from "module";
import { createClient } from "@supabase/supabase-js";

const require = createRequire("/home/runner/workspace/lib/db/package.json");
const pg = require("pg");

const BASE = "http://localhost:80/api";
const ORIGIN = "https://etscript.site";
const SECRET = process.env.PAYSTACK_SECRET_KEY;

let pass = 0,
  fail = 0;
const ok = (c, label, extra = "") => {
  if (c) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}  ${extra}`);
  }
};

const sign = (s) => crypto.createHmac("sha512", SECRET).update(s).digest("hex");

async function api(method, path, { token, body } = {}) {
  const headers = { Origin: ORIGIN };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get("content-type") || "";
  return { status: res.status, json: ct.includes("json") ? await res.json() : null };
}

async function webhook(obj) {
  const raw = JSON.stringify(obj);
  const res = await fetch(`${BASE}/payments/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-paystack-signature": sign(raw) },
    body: raw,
  });
  return res.status;
}

async function main() {
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const email = `e2e.${Date.now()}@gmail.com`;
  const password = `Test_${crypto.randomUUID()}`;
  const { data: created, error: ce } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (ce) throw new Error(ce.message);
  const userId = created.user.id;
  const { data: signin } = await anon.auth.signInWithPassword({ email, password });
  const token = signin.session.access_token;
  console.log(`\nTest user ${email} (${userId})`);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // --- Fix #1: re-subscribe after expiry ---
  console.log("\n=== FIX 1: re-subscribe after expiry ===");
  const c1 = await api("POST", "/payments/checkout", { token, body: { type: "premium_subscription" } });
  ok(c1.status === 200, "premium checkout #1", JSON.stringify(c1.json));
  await webhook({
    event: "charge.success",
    data: { reference: c1.json.reference, amount: 500000, currency: "NGN", customer: { customer_code: `CUS_${userId.slice(0, 8)}` } },
  });
  const s1 = await api("GET", "/subscription", { token });
  ok(s1.json?.plan === "premium" && s1.json?.status === "active", "active after first subscribe");

  // Simulate the paid period lapsing.
  await client.query(
    "UPDATE subscriptions SET current_period_end = now() - interval '2 days' WHERE user_id = $1",
    [userId],
  );
  const sExpired = await api("GET", "/subscription", { token });
  ok(sExpired.json?.plan === "free", "reads as free once period lapsed", JSON.stringify(sExpired.json));

  // Re-subscribe: ONLY charge.success (no subscription.create backstop).
  const c2 = await api("POST", "/payments/checkout", { token, body: { type: "premium_subscription" } });
  ok(c2.status === 200, "premium checkout #2 (re-subscribe)", JSON.stringify(c2.json));
  await webhook({
    event: "charge.success",
    data: { reference: c2.json.reference, amount: 500000, currency: "NGN", customer: { customer_code: `CUS_${userId.slice(0, 8)}` } },
  });
  const s2 = await api("GET", "/subscription", { token });
  ok(
    s2.json?.plan === "premium" && s2.json?.status === "active",
    "FIX: premium restored after re-subscribe (no stale past period)",
    JSON.stringify(s2.json),
  );
  const future = s2.json?.currentPeriodEnd && new Date(s2.json.currentPeriodEnd).getTime() > Date.now();
  ok(future, "currentPeriodEnd pushed back into the future", JSON.stringify(s2.json));

  // --- Fix #2: webhook refuses mismatched amount ---
  console.log("\n=== FIX 2: webhook amount mismatch refused ===");
  const m = await api("POST", "/manuscripts", { token, body: { title: `E2E Book ${Date.now()}` } });
  const j = await api("POST", "/jobs", {
    token,
    body: { manuscriptId: m.json.id, bookType: "Novel", publishingTarget: "Amazon KDP", theme: "Classic" },
  });
  const jobId = j.json.id;
  // Use a fresh non-premium user concept: this user is premium, so payg checkout is blocked.
  // Instead test mismatch directly against a payg txn for a SECOND fresh user.
  const email2 = `e2e.${Date.now()}b@gmail.com`;
  const { data: u2 } = await admin.auth.admin.createUser({ email: email2, password, email_confirm: true });
  const userId2 = u2.user.id;
  const { data: si2 } = await anon.auth.signInWithPassword({ email: email2, password });
  const token2 = si2.session.access_token;
  const m2 = await api("POST", "/manuscripts", { token: token2, body: { title: `E2E Book ${Date.now()}` } });
  const j2 = await api("POST", "/jobs", {
    token: token2,
    body: { manuscriptId: m2.json.id, bookType: "Novel", publishingTarget: "Amazon KDP", theme: "Classic" },
  });
  await api("POST", `/jobs/${j2.json.id}/process`, { token: token2 });
  const co = await api("POST", "/payments/checkout", { token: token2, body: { type: "payg_export", jobId: j2.json.id } });
  ok(co.status === 200, "payg checkout (user2)", JSON.stringify(co.json));
  // Webhook with WRONG amount (100 kobo instead of 250000) must NOT grant.
  await webhook({
    event: "charge.success",
    data: { reference: co.json.reference, amount: 100, currency: "NGN" },
  });
  const ea = await api("GET", `/payments/export-access/${j2.json.id}`, { token: token2 });
  ok(ea.json?.canDownloadClean === false, "mismatched-amount webhook did NOT grant access", JSON.stringify(ea.json));
  // Correct amount now grants.
  await webhook({
    event: "charge.success",
    data: { reference: co.json.reference, amount: 250000, currency: "NGN" },
  });
  const ea2 = await api("GET", `/payments/export-access/${j2.json.id}`, { token: token2 });
  ok(ea2.json?.canDownloadClean === true, "correct-amount webhook grants access", JSON.stringify(ea2.json));

  // cleanup
  console.log("\n=== CLEANUP ===");
  const ids = [userId, userId2];
  await client.query("DELETE FROM transactions WHERE user_id = ANY($1)", [ids]);
  await client.query("DELETE FROM subscriptions WHERE user_id = ANY($1)", [ids]);
  await client.query("DELETE FROM activity_log WHERE user_id = ANY($1)", [ids]);
  await client.query("DELETE FROM formatting_jobs WHERE manuscript_id IN (SELECT id FROM manuscripts WHERE user_id = ANY($1))", [ids]);
  await client.query("DELETE FROM manuscripts WHERE user_id = ANY($1)", [ids]);
  await client.end();
  await admin.auth.admin.deleteUser(userId).catch(() => {});
  await admin.auth.admin.deleteUser(userId2).catch(() => {});
  console.log("  cleaned");

  console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("HARNESS ERROR:", e);
  process.exit(2);
});
