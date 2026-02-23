# CESP for TON Agents

**Bring real-time audio observability to any TON agent during development.**

CESP (Coding Event Sound Protocol) is the open standard behind [PeonPing](https://github.com/PeonPing/peon-ping) -- adopted across 11 IDEs, 100+ sound packs, and 2.7k+ GitHub stars. This repo adapts CESP for the TON agent ecosystem so developers building Teleton plugins, trading bots, and autonomous agents get instant audio feedback on blockchain events.

## The Problem

You're building a TON agent locally. It connects to RPC, submits transactions, swaps tokens. You're coding in another window. Did the swap confirm? Did the contract revert? Is it stuck? You alt-tab to a block explorer. You scroll logs. You lose flow.

## The Solution

Wire 5 lines into your agent's event handlers. Now you *hear* what your agent is doing:

- Transaction submitted -> "Ready to work!"
- Transaction confirmed -> "Job's done!"
- Contract reverted -> "Oh no!"
- Approval needed -> "What you want?"
- Rate limited -> "Not enough resources"

100+ sound packs to choose from. Warcraft peons, GLaDOS, StarCraft battlecruisers, Zelda, Dota 2, and more.

## Demo

https://github.com/user-attachments/assets/cesp-ton-demo.mp4

See [`demo/cesp-ton-demo.mp4`](demo/cesp-ton-demo.mp4) -- a 30-second video showing a TON trading agent running locally with Warcraft Peon sound feedback on every blockchain event.

## Quick Start

```bash
# Install a sound pack
mkdir -p ~/.openpeon/packs
curl -fsSL https://github.com/PeonPing/og-packs/archive/refs/tags/v1.1.0.tar.gz | tar xz -C /tmp
cp -r /tmp/og-packs-*/peon ~/.openpeon/packs/peon

# Install the adapter
npm install cesp-ton
```

```typescript
import { createCespEmitter } from 'cesp-ton';

const cesp = createCespEmitter({
  pack: 'peon',       // any installed pack
  volume: 0.5,        // 0.0 - 1.0
});

// Wire into your agent's lifecycle
agent.on('boot',       () => cesp.emit('session.start'));
agent.on('tx:sent',    () => cesp.emit('task.acknowledge'));
agent.on('tx:confirm', () => cesp.emit('task.complete'));
agent.on('tx:fail',    () => cesp.emit('task.error'));
agent.on('approval',   () => cesp.emit('input.required'));
agent.on('ratelimit',  () => cesp.emit('resource.limit'));
```

That's it. Your agent now talks to you.

## TON Event Mapping

| TON Agent Event | CESP Category | When It Fires |
|---|---|---|
| Agent/bot started | `session.start` | Wallet initialized, RPC connected |
| Transaction submitted | `task.acknowledge` | Tx sent to mempool |
| Transaction confirmed | `task.complete` | On-chain confirmation received |
| Transaction failed | `task.error` | Contract reverted, tx rejected |
| Approval needed | `input.required` | High-value tx, unknown token, user confirmation |
| Rate/gas limit hit | `resource.limit` | RPC rate limit, gas estimation exceeded |
| Agent shutdown | `session.end` | Graceful disconnect (extended) |

## Framework Integration

See the [`examples/`](./examples) directory for drop-in integrations:

- **[Teleton Plugin](./examples/teleton-plugin.ts)** -- Full plugin for the Teleton agent framework
- **[Generic Agent](./examples/generic-agent.ts)** -- Standalone example for any Node.js-based TON agent

For framework authors: see [INTEGRATE.md](./INTEGRATE.md) for the full integration guide.

## Why CESP?

CESP is a battle-tested open standard. The ecosystem already exists:

- **100+ sound packs** across gaming, sci-fi, comedy, and ambient genres
- **11 IDE integrations** -- Claude Code, Cursor, GitHub Copilot, Windsurf, Kiro, and more
- **2.7k+ GitHub stars** on the reference implementation
- **Open registry** at [openpeon.com/packs](https://openpeon.com/packs) -- browse, preview, install
- **Community-driven** -- anyone can create and publish a pack

This submission doesn't reinvent the wheel. It brings a proven developer experience layer to TON agent builders.

## Links

- [CESP v1.0 Spec](https://openpeon.com/spec)
- [Sound Pack Registry](https://peonping.github.io/registry/index.json) (100+ packs)
- [Browse Packs](https://openpeon.com/packs)
- [PeonPing Reference Implementation](https://github.com/PeonPing/peon-ping)
- [OpenPeon Standard](https://github.com/PeonPing/openpeon)

## License

MIT
