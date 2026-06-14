import { execSync } from "child_process";

const TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const OWNER = process.env.GITHUB_OWNER || "forlan-hub";
const REPO = process.env.GITHUB_REPO || "Etscript";
const INTERVAL_MS = parseInt(process.env.AUTO_PUSH_INTERVAL_MS || "600000", 10); // default 10 min

if (!TOKEN) {
  console.error("GITHUB_PERSONAL_ACCESS_TOKEN is not set. Exiting.");
  process.exit(1);
}

const REMOTE_URL = `https://x-access-token:${TOKEN}@github.com/${OWNER}/${REPO}.git`;

function run(cmd: string, opts?: { cwd?: string; noPrompt?: boolean }): string {
  const extraEnv: Record<string, string> = opts?.noPrompt
    ? { GIT_TERMINAL_PROMPT: "0", GIT_ASKPASS: "echo", SSH_ASKPASS: "echo" }
    : {};
  try {
    return execSync(cmd, {
      encoding: "utf8",
      cwd: opts?.cwd ?? "/home/runner/workspace",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...extraEnv },
    }).trim();
  } catch (err: unknown) {
    const e = err as { stderr?: string; message?: string };
    return e?.stderr ?? e?.message ?? String(err);
  }
}

function setup() {
  run(`git config user.name "forlan-hub"`);
  run(`git config user.email "forlan-hub@users.noreply.github.com"`);

  const remotes = run("git remote -v");
  if (!remotes.includes("origin")) {
    run(`git remote add origin "${REMOTE_URL}"`);
    console.log(`[auto-push] Added remote origin → github.com/${OWNER}/${REPO}`);
  } else {
    run(`git remote set-url origin "${REMOTE_URL}"`);
  }
}

function push() {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);

  run("git add -A");

  const diff = run("git diff --cached --name-only");
  if (diff) {
    const files = diff.split("\n").filter(Boolean);
    const count = files.length;
    const preview = files.slice(0, 3).join(", ") + (count > 3 ? ` +${count - 3} more` : "");
    const msg = `chore: auto-save ${count} file${count > 1 ? "s" : ""} [${timestamp}] — ${preview}`;
    run(`git commit -m ${JSON.stringify(msg)}`);
    console.log(`[auto-push] ${timestamp} — committed ${count} file(s): ${preview}`);
  }

  // Push any unpushed commits (including those created by the checkpoint system).
  // origin is already set to REMOTE_URL (token embedded) by setup().
  // We push to "origin main" so the local origin/main tracking ref stays in sync.
  // noPrompt env vars disable replit-git-askpass so git uses the URL token directly.
  run(`git fetch origin main 2>/dev/null || true`, { noPrompt: true });
  const ahead = run("git log origin/main..main --oneline 2>/dev/null");
  if (ahead) {
    const commitCount = ahead.split("\n").filter(Boolean).length;
    const result = run(
      `git -c credential.helper='' -c core.askPass='' push origin main`,
      { noPrompt: true },
    );
    console.log(`[auto-push] ${timestamp} — pushed ${commitCount} commit(s)\n  ${result}`);
  } else if (!diff) {
    console.log(`[auto-push] ${timestamp} — nothing to commit or push.`);
  }
}

async function loop() {
  console.log(`[auto-push] Starting. Will push every ${INTERVAL_MS / 1000}s.`);
  setup();

  // Initial push on startup
  push();

  setInterval(() => {
    push();
  }, INTERVAL_MS);
}

loop();
