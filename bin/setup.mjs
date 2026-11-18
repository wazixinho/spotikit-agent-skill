#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_NAME = "spotikit-extension-dev";
const SOURCE_SKILL_DIR = path.resolve(__dirname, "..", "skills", SKILL_NAME);

function getAgentTargets() {
  const home = os.homedir();
  const cwd = process.cwd();
  return [
    {
      id: "antigravity-global",
      name: "Antigravity IDE (Global)",
      detectDir: path.join(home, ".gemini", "antigravity"),
      destDir: path.join(home, ".gemini", "antigravity", "skills", SKILL_NAME),
    },
    {
      id: "claude-code-global",
      name: "Claude Code (Global)",
      detectDir: path.join(home, ".claude"),
      destDir: path.join(home, ".claude", "skills", SKILL_NAME),
    },
    {
      id: "opencode-global",
      name: "OpenCode (Global)",
      detectDir: path.join(home, ".config", "opencode"),
      destDir: path.join(home, ".config", "opencode", "skills", SKILL_NAME),
    },
    {
      id: "codex-global",
      name: "Codex / OpenAI CLI (Global)",
      detectDir: path.join(home, ".codex"),
      destDir: path.join(home, ".codex", "skills", SKILL_NAME),
    },
    {
      id: "workspace-agent",
      name: "Current Workspace (.agent/skills)",
      detectDir: cwd,
      destDir: path.join(cwd, ".agent", "skills", SKILL_NAME),
    },
  ];
}

function detectActiveTargets(forceAll = false) {
  const targets = getAgentTargets();
  const detected = targets.filter((t) => forceAll || fs.existsSync(t.detectDir));
  return detected.length > 0 ? detected : [targets[targets.length - 1]];
}

function printPlan(targets) {
  console.log("==============================================================");
  console.log("  SpotiKit Agent Skill - Setup Plan (spotikit-extension-dev)  ");
  console.log("==============================================================");
  console.log(`Source package: ${SOURCE_SKILL_DIR}`);
  console.log("\nFiles to install:");
  console.log("  - SKILL.md (Workflow rules, lifecycle laws, build & check steps)");
  console.log("  - references/api-and-migration.md (Spicetify -> SpotiKit map)");
  console.log("\nDetected coding agent targets:");
  for (const t of targets) {
    const exists = fs.existsSync(t.destDir);
    const status = exists ? "[UPDATE + BACKUP .bak]" : "[NEW INSTALL]";
    console.log(`  * ${t.name}`);
    console.log(`    Path: ${t.destDir} ${status}`);
  }
  console.log("==============================================================\n");
}

function copySkillFiles(destDir) {
  if (fs.existsSync(destDir)) {
    const backupDir = `${destDir}.bak-${Date.now()}`;
    fs.cpSync(destDir, backupDir, { recursive: true });
    console.log(`  [Backup] Existing skill backed up to: ${backupDir}`);
  }
  fs.mkdirSync(path.join(destDir, "references"), { recursive: true });
  fs.copyFileSync(
    path.join(SOURCE_SKILL_DIR, "SKILL.md"),
    path.join(destDir, "SKILL.md")
  );
  fs.copyFileSync(
    path.join(SOURCE_SKILL_DIR, "references", "api-and-migration.md"),
    path.join(destDir, "references", "api-and-migration.md")
  );
}

function verifyInstallation(targets) {
  console.log("\nVerifying SpotiKit Agent Skill installation...");
  let passed = 0;
  for (const t of targets) {
    const skillFile = path.join(t.destDir, "SKILL.md");
    const refFile = path.join(t.destDir, "references", "api-and-migration.md");
    if (fs.existsSync(skillFile) && fs.existsSync(refFile)) {
      const content = fs.readFileSync(skillFile, "utf8");
      const validFrontmatter = content.startsWith("---") && content.includes("name: spotikit-extension-dev");
      if (validFrontmatter) {
        console.log(`  [OK] ${t.name} -> Verified (${skillFile})`);
        passed++;
      } else {
        console.error(`  [FAIL] ${t.name} -> Invalid SKILL.md frontmatter`);
      }
    }
  }
  if (passed === 0) {
    console.error("  [FAIL] No verified installations found. Run `setup --apply` first.");
    process.exit(1);
  }
  console.log(`\nVerification complete: ${passed} agent target(s) active and verified.`);
}

async function askApproval() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question("Approve and apply this setup plan? (y/N): ", (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || "setup";
  const isPlanOnly = args.includes("--plan");
  const isApply = args.includes("--apply") || args.includes("-y") || args.includes("--yes");
  const isVerifyOnly = cmd === "verify" || args.includes("--verify");
  const targets = detectActiveTargets(args.includes("--all"));

  if (isVerifyOnly) {
    verifyInstallation(targets);
    return;
  }

  printPlan(targets);

  if (isPlanOnly) {
    console.log("Plan generated. Re-run with `--apply` after user approval to complete setup.");
    return;
  }

  let approved = isApply;
  if (!approved) {
    approved = await askApproval();
  }

  if (!approved) {
    console.log("Setup cancelled by user.");
    process.exit(0);
  }

  for (const t of targets) {
    copySkillFiles(t.destDir);
    console.log(`  [Installed] ${t.name} -> ${t.destDir}`);
  }

  verifyInstallation(targets);
}

main().catch((err) => {
  console.error("Error running spotikit-skill setup:", err);
  process.exit(1);
});
