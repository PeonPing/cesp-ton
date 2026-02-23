/**
 * cesp-ton: CESP sound adapter for TON agents
 *
 * Lightweight adapter that loads an OpenPeon sound pack manifest
 * and plays sounds for CESP event categories. Zero dependencies
 * beyond Node.js built-ins.
 */

import { execFile } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, platform } from 'node:os';

// CESP v1.0 categories
type CespCategory =
  | 'session.start'
  | 'task.acknowledge'
  | 'task.complete'
  | 'task.error'
  | 'input.required'
  | 'resource.limit'
  | 'session.end'
  | 'task.progress'
  | 'user.spam';

interface Sound {
  file: string;
  label?: string;
}

interface CategoryEntry {
  sounds: Sound[];
}

interface PackManifest {
  cesp_version: string;
  name: string;
  display_name: string;
  version: string;
  categories: Record<string, CategoryEntry>;
  category_aliases?: Record<string, string>;
}

interface CespOptions {
  /** Pack name (must be installed in ~/.openpeon/packs/ or packDir) */
  pack: string;
  /** Master volume 0.0 - 1.0 (default: 0.5) */
  volume?: number;
  /** Custom pack directory (default: ~/.openpeon/packs) */
  packDir?: string;
  /** Start muted (default: false) */
  muted?: boolean;
  /** Debounce interval in ms (default: 500) */
  debounceMs?: number;
}

interface CespEmitter {
  emit: (category: CespCategory) => void;
  mute: () => void;
  unmute: () => void;
  setVolume: (v: number) => void;
}

/**
 * Resolve the path to an installed sound pack's manifest.
 */
function resolvePackDir(packName: string, customDir?: string): string {
  const base = customDir || join(homedir(), '.openpeon', 'packs');
  return join(base, packName);
}

/**
 * Load and parse an openpeon.json manifest.
 */
function loadManifest(packDir: string): PackManifest {
  const manifestPath = join(packDir, 'openpeon.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`No openpeon.json found at ${manifestPath}. Is the pack installed?`);
  }
  return JSON.parse(readFileSync(manifestPath, 'utf-8'));
}

/**
 * Resolve sounds for a category, checking aliases if needed.
 */
function resolveSounds(manifest: PackManifest, category: string): Sound[] | null {
  if (manifest.categories[category]) {
    return manifest.categories[category].sounds;
  }
  if (manifest.category_aliases) {
    const alias = Object.entries(manifest.category_aliases).find(([, v]) => v === category);
    if (alias && manifest.categories[alias[0]]) {
      return manifest.categories[alias[0]].sounds;
    }
    // Also check if the category itself is an alias key
    const target = manifest.category_aliases[category];
    if (target && manifest.categories[target]) {
      return manifest.categories[target].sounds;
    }
  }
  return null;
}

/**
 * Play a sound file asynchronously. Never blocks.
 */
function playSound(filePath: string, volume: number): void {
  const os = platform();

  const opts = { windowsHide: true };

  if (os === 'darwin') {
    const proc = execFile('afplay', ['-v', String(volume), filePath], opts);
    proc.unref();
  } else if (os === 'linux') {
    const players: [string, string[]][] = [
      ['pw-play', [`--volume=${volume}`, filePath]],
      ['paplay', [`--volume=${Math.round(volume * 65536)}`, filePath]],
      ['aplay', [filePath]],
    ];

    const tryPlayer = (idx: number) => {
      if (idx >= players.length) return;
      const [cmd, args] = players[idx];
      const proc = execFile(cmd, args, opts);
      proc.on('error', () => tryPlayer(idx + 1));
      proc.unref();
    };
    tryPlayer(0);
  } else if (os === 'win32') {
    const ps = `$p=New-Object System.Windows.Media.MediaPlayer;$p.Open([Uri]::new('${filePath.replace(/'/g, "''")}'));$p.Volume=${volume};$p.Play();Start-Sleep -Seconds 5`;
    const proc = execFile('powershell', ['-NoProfile', '-Command', ps], opts);
    proc.unref();
  }
}

/**
 * Create a CESP emitter for a TON agent.
 *
 * @example
 * ```typescript
 * const cesp = createCespEmitter({ pack: 'peon', volume: 0.5 });
 *
 * agent.on('boot',       () => cesp.emit('session.start'));
 * agent.on('tx:sent',    () => cesp.emit('task.acknowledge'));
 * agent.on('tx:confirm', () => cesp.emit('task.complete'));
 * agent.on('tx:fail',    () => cesp.emit('task.error'));
 * agent.on('approval',   () => cesp.emit('input.required'));
 * agent.on('ratelimit',  () => cesp.emit('resource.limit'));
 * ```
 */
export function createCespEmitter(options: CespOptions): CespEmitter {
  const packDir = resolvePackDir(options.pack, options.packDir);
  const manifest = loadManifest(packDir);
  let volume = options.volume ?? 0.5;
  let muted = options.muted ?? false;
  const debounceMs = options.debounceMs ?? 500;

  // Track last sound per category for no-repeat
  const lastPlayed = new Map<string, string>();
  // Track last emit time per category for debounce
  const lastEmitTime = new Map<string, number>();

  return {
    emit(category: CespCategory) {
      if (muted) return;

      // Debounce
      const now = Date.now();
      const lastTime = lastEmitTime.get(category) ?? 0;
      if (now - lastTime < debounceMs) return;
      lastEmitTime.set(category, now);

      // Resolve sounds
      const sounds = resolveSounds(manifest, category);
      if (!sounds || sounds.length === 0) return;

      // Pick random, avoiding last played
      let candidates = sounds;
      if (sounds.length > 1) {
        const last = lastPlayed.get(category);
        if (last) {
          candidates = sounds.filter((s) => s.file !== last);
        }
      }
      const pick = candidates[Math.floor(Math.random() * candidates.length)];

      // Track and play
      lastPlayed.set(category, pick.file);
      const filePath = join(packDir, pick.file);
      playSound(filePath, volume);
    },

    mute() {
      muted = true;
    },

    unmute() {
      muted = false;
    },

    setVolume(v: number) {
      volume = Math.max(0, Math.min(1, v));
    },
  };
}
