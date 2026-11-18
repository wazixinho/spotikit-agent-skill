# SpotiKit Agent Skill (`spotikit-extension-dev`)

An AI agentic skill for migrating already existing extensions of Spicetify directly to be compatible with SpotiKit.

It equips AI coding agents (Antigravity, Claude Code, OpenCode, Cursor, Codex) with SpotiKit architecture standards, manifest rules (`spotikit.json`), lifecycle management (`start`, `onStop`, `signal`), and API mappings to convert legacy Spicetify extensions into compliant SpotiKit extensions.

---

## Installation Methods

### Method 1: GitHub / npx (Recommended)

Paste this prompt directly into your AI coding agent:

> ›Install the SpotiKit Agent Skill and connect it to this coding agent using `npx github:wazixinho/spotikit-agent-skill setup`. Show me the setup plan for approval, then verify the installation.

Or install via the Agent Skills CLI:
```bash
npx skills add wazixinho/spotikit-agent-skill --skill spotikit-extension-dev
```

### Method 2: Local Install

If you cloned or downloaded the repository locally, run:

```bash
node bin/setup.mjs setup --apply
```

Or prompt your AI coding agent:

> ›Install the SpotiKit Agent Skill and connect it to this coding agent using `node "./bin/setup.mjs" setup --plan`. Show me the setup plan for approval, then run `node "./bin/setup.mjs" setup --apply` and verify the installation.
