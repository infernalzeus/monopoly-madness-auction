---
name: project-context
description: Tech stack, version, architecture, and mechanic inventory for Monopoly Madness Auction
metadata:
  type: project
---

Current version: **v1.0.9.7** (as of 2026-06-05)

**Stack**: React + TypeScript + Tailwind CSS + Firebase Firestore. No backend — pure client-side game engine in `src/gameEngine/core.ts` (pure functions), state managed via `useGameLogic.ts`, Firebase for multiplayer sync.

**Architecture pattern**: Unidirectional data flow. `core.ts` = pure state mutations. `useGameLogic.ts` = adapter (local state OR Firestore transactions). Components read state, call hook functions.

**Why:** arch.md contains the full authoritative developer manual. Always read it before making changes.

**How to apply:** Modify types first → engine → hook → components, in that order. Always follow the developer checklist in arch.md.

**Key mechanics added per version:**
- v1.0.9.7: Jail pay-to-leave (20% income), Chance/CC income cards (odd/even roll), Workers mode (auto-build on passGO), token fix (Fuchsia replaces Violet), board corner text fix
- v1.0.9.6: Mobile scroll, neon dice logo, passGO 10%, board name wrap, color system, bot color, z-index
- v1.0.9.5: Previous baseline
