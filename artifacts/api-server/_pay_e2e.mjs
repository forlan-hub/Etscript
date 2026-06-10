import crypto from "crypto";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:80/api";
const ORIGIN = "https://etscript.site";
const SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.SUPABASE_ANON_KEY;

let pass = 0;
let fail = 0;
const ok = (cond, label, extra = "") => {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}  ${extra}`);
  }
};

function sign(bodyStr) {
  return crypto.createHmac("sha512", SECRET).update(bodyStr).digest("hex");
}

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
  const payload = ct.includes("application/json") ? await res.json() : null;
  return { status: res.status, json: payload, res };
}

async function postWebhook(eventObj) {
  const raw = JSON.stringify(eventObj);
  const res = await fetch(`${BASE}/payments/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-paystack-signature": sign(raw) },
    body: raw,
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

async function downloadLen(token, jobId, format) {
  const res = await fetch(`${BASE}/jobs/${jobId}/download/${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { status: res.status, len: 0, head: "" };
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, len: buf.length, head: buf.slice(0, 4).toString("latin1") };
}

async function main() {
  for (const [k, v] of Object.entries({ SECRET, SUPABASE_URL, SERVICE_ROLE, ANON })) {
    if (!v) throw new Error(`Missing env ${k}`);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anon = createClient(SUPABASE_URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = `e2e.${Date.now()}@gmail.com`;
  const password = `Test_${crypto.randomUUID()}`;
  const { data: created, error: ce } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (ce) throw new Error(`createUser failed: ${ce.message}`);
  const userId = created.user.id;
  fs.writeFileSync("/tmp/e2e_userid.txt", userId);
  const { data: signin, error: se } = await anon.auth.signInWithPassword({ email, password });
  if (se) throw new Error(`signIn failed: ${se.message}`);
  const token = signin.session.access_token;
  console.log(`\nTest user ${email} (${userId})`);

  // Setup: manuscript -> job -> process
  const m = await api("POST", "/manuscripts", { token, body: { title: `E2E Book ${Date.now()}` } });
  ok(m.status === 201, "create manuscript", JSON.stringify(m.json));
  const manuscriptId = m.json?.id;

  const j = await api("POST", "/jobs", {
    token,
    body: { manuscriptId, bookType: "Novel", publishingTarget: "Amazon KDP", theme: "Classic" },
  });
  ok(j.status === 201, "create job", JSON.stringify(j.json));
  const jobId = j.json?.id;

  const p = await api("POST", `/jobs/${jobId}/process`, { token });
  ok(p.status === 200 && p.json?.status === "completed", "process job -> completed");

  console.log("\n=== PAYG FLOW ===");
  const ea0 = await api("GET", `/payments/export-access/${jobId}`, { token });
  ok(ea0.json?.canDownloadClean === false && ea0.json?.plan === "free", "pre-pay: no clean access");

  const wmPdf = await downloadLen(token, jobId, "pdf");
  ok(wmPdf.status === 200 && wmPdf.head === "%PDF", "watermarked PDF downloads", wmPdf.head);

  const co = await api("POST", "/payments/checkout", { token, body: { type: "payg_export", jobId } });
  ok(co.status === 200 && /^https:\/\//.test(co.json?.authorizationUrl || ""), "payg checkout -> Paystack URL", JSON.stringify(co.json));
  const paygRef = co.json?.reference;
  ok(!!paygRef, "payg checkout returns reference");

  // Duplicate checkout before payment is allowed (still pending) -> still returns URL
  const wh1 = await postWebhook({
    event: "charge.success",
    data: { reference: paygRef, amount: 250000, currency: "NGN", status: "success" },
  });
  ok(wh1.status === 200, "payg webhook accepted (valid signature)");

  // Tampered signature must be rejected
  const rawBad = JSON.stringify({ event: "charge.success", data: { reference: paygRef } });
  const badRes = await fetch(`${BASE}/payments/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-paystack-signature": "deadbeef" },
    body: rawBad,
  });
  ok(badRes.status === 401, "webhook rejects bad signature", String(badRes.status));

  const ea1 = await api("GET", `/payments/export-access/${jobId}`, { token });
  ok(ea1.json?.canDownloadClean === true && ea1.json?.jobPaid === true, "post-pay: clean access granted", JSON.stringify(ea1.json));

  const cleanPdf = await downloadLen(token, jobId, "pdf");
  ok(cleanPdf.status === 200 && cleanPdf.head === "%PDF", "clean PDF downloads");
  ok(wmPdf.len > cleanPdf.len, "watermarked PDF larger than clean", `wm=${wmPdf.len} clean=${cleanPdf.len}`);

  // checkout again now that it's unlocked -> should be rejected 400
  const coDup = await api("POST", "/payments/checkout", { token, body: { type: "payg_export", jobId } });
  ok(coDup.status === 400, "checkout rejected for already-unlocked job", String(coDup.status));

  console.log("\n=== PREMIUM FLOW ===");
  const s0 = await api("GET", "/subscription", { token });
  ok(s0.json?.plan === "free", "pre-sub: free plan");

  const pco = await api("POST", "/payments/checkout", { token, body: { type: "premium_subscription" } });
  ok(pco.status === 200 && /^https:\/\//.test(pco.json?.authorizationUrl || ""), "premium checkout -> Paystack URL (plan ensured)", JSON.stringify(pco.json));
  const premRef = pco.json?.reference;

  const customerCode = `CUS_e2e_${Date.now()}`;
  const wh2 = await postWebhook({
    event: "charge.success",
    data: {
      reference: premRef,
      amount: 500000,
      currency: "NGN",
      status: "success",
      customer: { customer_code: customerCode },
      plan: "PLN_e2e_test",
    },
  });
  ok(wh2.status === 200, "premium charge.success webhook accepted");

  const subCode = `SUB_e2e_${Date.now()}`;
  const nextPay = new Date(Date.now() + 30 * 86400000).toISOString();
  const wh3 = await postWebhook({
    event: "subscription.create",
    data: {
      customer: { customer_code: customerCode },
      subscription_code: subCode,
      next_payment_date: nextPay,
      // email_token intentionally omitted -> exercises local-cancel branch
    },
  });
  ok(wh3.status === 200, "subscription.create webhook accepted");

  const s1 = await api("GET", "/subscription", { token });
  ok(s1.json?.plan === "premium" && s1.json?.status === "active", "premium active after webhooks", JSON.stringify(s1.json));
  ok(!!s1.json?.currentPeriodEnd, "premium has currentPeriodEnd");

  // With premium active, payg checkout on a NEW concept should be blocked because premium already grants clean.
  const premBlocksPayg = await api("POST", "/payments/checkout", { token, body: { type: "premium_subscription" } });
  ok(premBlocksPayg.status === 400, "duplicate premium checkout blocked", String(premBlocksPayg.status));

  const cancel = await api("POST", "/subscription/cancel", { token });
  ok(cancel.status === 200 && cancel.json?.status === "cancelled", "cancel subscription (local branch)", JSON.stringify(cancel.json));
  ok(cancel.json?.plan === "premium", "still premium until period end (grace)");

  // Cleanup (Supabase auth user here; DB rows cleaned via lib/db pg afterwards)
  console.log("\n=== CLEANUP ===");
  await admin.auth.admin.deleteUser(userId).catch(() => {});
  console.log(`  test user deleted (db rows for ${userId} cleaned externally)`);

  console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("HARNESS ERROR:", e);
  process.exit(2);
});
