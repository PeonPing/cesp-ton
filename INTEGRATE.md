# Add CESP Sound Support to Your TON Agent

You are adding sound pack support to a TON agent using the CESP (Coding Event Sound Protocol) open standard. CESP lets any agent tap into 100+ community sound packs -- from Warcraft peons to GLaDOS to StarCraft battlecruisers.

## What You're Building

When your TON agent does something notable (boots up, submits a transaction, gets confirmation, hits an error), it plays a sound from the user's installed CESP sound pack. Developers monitoring their agent during local development get real-time audio feedback without you recording a single sound file.

## Step 1: Map Your Agent's Events to CESP Categories

### Core Categories (implement all 6 -- silently skip any the active pack doesn't have)

| CESP Category | TON Agent Event | Example |
|---|---|---|
| `session.start` | Agent starts, wallet initializes | Bot connects to RPC, loads wallet |
| `task.acknowledge` | Transaction submitted | Tx sent to mempool, swap initiated |
| `task.complete` | Transaction confirmed | On-chain confirmation, successful swap |
| `task.error` | Transaction failed | Contract reverted, insufficient gas, tx rejected |
| `input.required` | Approval needed | High-value tx, unknown token, user confirmation required |
| `resource.limit` | Rate/resource limit hit | RPC rate limit, gas estimate too high, token quota exceeded |

### Extended Categories (optional)

| CESP Category | TON Agent Event | Example |
|---|---|---|
| `session.end` | Agent shuts down | Graceful disconnect, session cleanup |
| `task.progress` | Long operation ongoing | Multi-step swap in progress, waiting for finality |
| `user.spam` | Too many commands | User triggering actions faster than agent can process |

## Step 2: Read the Sound Pack Manifest

Each sound pack has an `openpeon.json` manifest at its root:

```json
{
  "cesp_version": "1.0",
  "name": "peon",
  "display_name": "Warcraft Peon",
  "version": "1.0.0",
  "categories": {
    "session.start": {
      "sounds": [
        { "file": "sounds/Hello.wav", "label": "Something need doing?" },
        { "file": "sounds/ReadyToWork.wav", "label": "Ready to work!" }
      ]
    },
    "task.complete": {
      "sounds": [
        { "file": "sounds/JobsDone.wav", "label": "Job's done!" }
      ]
    },
    "task.error": {
      "sounds": [
        { "file": "sounds/OhNo.wav", "label": "Oh no!" }
      ]
    },
    "input.required": {
      "sounds": [
        { "file": "sounds/WhatYouWant.wav", "label": "What you want?" }
      ]
    }
  }
}
```

**Sound lookup:** Check `categories[category]` first. If missing, check `category_aliases` for a mapping. If still missing, skip silently.

**File paths** in the manifest are relative to the manifest file, using forward slashes.

## Step 3: Install a Sound Pack

### Quick: Bundle One Pack

```bash
mkdir -p sounds/peon
curl -fsSL https://github.com/PeonPing/og-packs/archive/refs/tags/v1.1.0.tar.gz | tar xz -C /tmp
cp -r /tmp/og-packs-*/peon/* sounds/peon/
```

### Full: Support Multiple Packs via Registry

The pack registry lives at: `https://peonping.github.io/registry/index.json`

Each entry has:
```json
{
  "name": "glados",
  "display_name": "GLaDOS",
  "source_repo": "PeonPing/og-packs",
  "source_ref": "v1.1.0",
  "source_path": "glados",
  "categories": ["session.start", "task.complete", "task.error", "input.required"],
  "sound_count": 28,
  "total_size_bytes": 1843200
}
```

To download a pack:
1. Fetch `https://github.com/{source_repo}/archive/refs/tags/{source_ref}.tar.gz`
2. Extract `{source_path}/` to `~/.openpeon/packs/{name}/`
3. Verify `openpeon.json` exists at the pack root

## Step 4: Play Audio

**Always play async. Never block the agent.**

### macOS
```bash
nohup afplay -v 0.5 /path/to/sound.wav >/dev/null 2>&1 &
```

### Linux (try in order, use first available)
```bash
pw-play --volume=0.5 sound.wav    # PipeWire
paplay --volume=32768 sound.wav   # PulseAudio (0-65536 scale)
ffplay -nodisp -autoexit -volume 50 sound.wav  # FFmpeg
aplay sound.wav                   # ALSA (no volume control)
```

### Windows (PowerShell)
```powershell
$player = New-Object System.Windows.Media.MediaPlayer
$player.Open([Uri]::new((Resolve-Path "sound.wav")))
$player.Volume = 0.5
$player.Play()
```

### Node.js (cross-platform)

Use the `cesp-ton` adapter (see `src/cesp-ton.ts` in this repo) which handles platform detection and async playback automatically.

## Step 5: Required Behavior

1. **Support all 6 core categories** -- silently skip if the pack has no sounds for a category
2. **Master volume control** -- 0.0 to 1.0, configurable
3. **Global mute toggle** -- one setting to silence everything
4. **No-repeat logic** -- track the last sound played per category, exclude it from next pick (if >1 sound available)
5. **Debounce rapid events** -- skip if <500ms since last sound in same category

## Step 6: Wire It Up

### Using the cesp-ton adapter (recommended)

```typescript
import { createCespEmitter } from 'cesp-ton';

const cesp = createCespEmitter({ pack: 'peon', volume: 0.5 });

// In your agent's event handlers:
cesp.emit('session.start');   // on boot
cesp.emit('task.acknowledge'); // on tx submitted
cesp.emit('task.complete');    // on tx confirmed
cesp.emit('task.error');       // on tx failed
cesp.emit('input.required');   // on approval needed
cesp.emit('resource.limit');   // on rate limit
```

### For Teleton plugins

See `examples/teleton-plugin.ts` for a complete drop-in plugin.

### For any other framework

The adapter is ~100 lines with zero dependencies beyond Node.js built-ins. Copy `src/cesp-ton.ts` into your project if you don't want the npm dependency.

## Links

- [CESP v1.0 Spec](https://openpeon.com/spec)
- [Browse 100+ Packs](https://openpeon.com/packs)
- [Pack Registry](https://peonping.github.io/registry/index.json)
- [Reference Implementation](https://github.com/PeonPing/peon-ping)
