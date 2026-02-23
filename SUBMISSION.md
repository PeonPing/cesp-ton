# Contest Submission

**Contest:** Fast Grants for Agent Tooling on TON (identityhub.app)

**Title:** CESP-TON: Audio Observability for TON Agents

**Track:** Developer Utilities

## Description

CESP-TON brings the CESP (Coding Event Sound Protocol) ecosystem to TON agent development. CESP is the open standard behind PeonPing -- 2.7k+ GitHub stars, 100+ sound packs, adopted across 11 IDEs including Claude Code, Cursor, GitHub Copilot, and Windsurf.

The problem: developers building TON agents locally (Teleton plugins, trading bots, DeFi automation) are stuck alt-tabbing to block explorers and scrolling logs to understand what their agent is doing. There's no ambient feedback layer.

CESP-TON solves this with a lightweight TypeScript adapter that maps TON agent lifecycle events to CESP sound categories. Transaction submitted, confirmed, reverted, approval needed -- developers hear it all while they work in another window. 100+ sound packs available out of the box, from Warcraft peons to GLaDOS to StarCraft battlecruisers.

The repo includes a drop-in integration guide (INTEGRATE.md) for any TON agent framework, a zero-dependency TypeScript adapter (~120 lines), a ready-made Teleton plugin example, and a generic agent example. Any TON agent can wire in CESP audio feedback in 5 lines of code.

This isn't a new standard -- it's a bridge from a battle-tested, widely-adopted developer experience layer into the TON agent ecosystem.

## Links

- **Repo:** https://github.com/PeonPing/cesp-ton
- **Docs:** https://openpeon.com/spec
- **Demo:** [demo/cesp-ton-demo.mp4](demo/cesp-ton-demo.mp4) (video in repo)
- **Browse Packs:** https://openpeon.com/packs
