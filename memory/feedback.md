---
name: feedback
description: Preferences and patterns for working on this repo
metadata:
  type: feedback
---

Always read arch.md before making changes — it documents the current architecture and must be kept in sync.

**Why:** The user explicitly referenced arch.md and asked to "modify accordingly" in v1.0.9.7 — treat it as the single source of truth for architecture decisions.

**How to apply:** After any feature set, update arch.md version number and add a section documenting the new subsystem. Use the same format as existing sections (emoji heading, schema snippets, mechanic explanation).

---

Commit style: prefix with version tag, list all changed areas briefly, include mechanic summary. Reference arch.md updates in commit message.

**Why:** Observed from previous commits in git log (e.g. "v1.0.9.6 - mobile scroll, neon dice logo, passGO 10%...").

**How to apply:** Always use `v<version> - <comma-separated feature list>` format for commit subject.
