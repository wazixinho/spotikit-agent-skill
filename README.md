# SpotiKit Extension Dev — AI Agent Skill (`spotikit-extension-dev`)

An REA-style Agentic Skill package for **Antigravity IDE**, **Claude Code**, **OpenCode**, **Cursor**, and **Codex**. It teaches your coding agent the complete **SpotiKit** architecture, `spotikit.json` manifest laws, lifecycle cleanup (`start` / `onStop` / `signal`), Spicetify-to-SpotiKit API migration mappings, semantic CSS class names, and `spotikit-kit` verification commands.

---

## 1. Install via Coding Agent Prompt (REA-Style Workflow)

### Option A: Local Folder Install (Immediate, No Publishing Needed)
Unzip `spotikit-agent-skill.zip` anywhere on your PC (e.g., `C:\tools\spotikit-agent-skill`), then paste this prompt into your coding agent:

> ›Install the SpotiKit Agent Skill and connect it to this coding agent using `node "C:/tools/spotikit-agent-skill/bin/setup.mjs" setup --plan`. Show me the setup plan for approval, then run `node "C:/tools/spotikit-agent-skill/bin/setup.mjs" setup --apply` and verify the installation.

### Option B: GitHub + `npx` Install (Like `npx rea-agents@latest setup`)
Push this folder to a GitHub repository (e.g., `https://github.com/wazixinho/spotikit-agent-skill`) or publish to npm (`npm publish`), then install on any machine with:

> ›Install the SpotiKit Agent Skill and connect it to this coding agent using `npx github:wazixinho/spotikit-agent-skill setup`. Show me the setup plan for approval, then verify the installation.

Or via the standard Agent Skills CLI:
```bash
npx skills add wazixinho/spotikit-agent-skill --skill spotikit-extension-dev
```

---

## 2. CLI Commands (`bin/setup.mjs`)

| Command | Description |
| :--- | :--- |
| `node bin/setup.mjs setup --plan` | Detects installed coding agents (Antigravity, Claude Code, OpenCode, Codex, Workspace) and prints the setup plan without modifying files. |
| `node bin/setup.mjs setup --apply` | Backs up any existing installation and installs `SKILL.md` + `references/api-and-migration.md` into all detected agents. |
| `node bin/setup.mjs verify` | Verifies frontmatter and reference files across all installed coding agent directories. |

---

## 3. Package Structure

```text
spotikit-agent-skill/
├── bin/
│   └── setup.mjs                                  # REA-style plan, backup, install & verify CLI
├── skills/
│   └── spotikit-extension-dev/
│       ├── SKILL.md                               # Core agent workflow & SpotiKit laws
│       └── references/
│           └── api-and-migration.md               # Spicetify -> SpotiKit map, Platform APIs & CSS classes
├── package.json                                   # Ready for `npx` / GitHub / npm
└── README.md
```
