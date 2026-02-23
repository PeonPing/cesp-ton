/**
 * CESP Sound Plugin for Teleton
 *
 * Drop-in Teleton plugin that plays CESP sound pack audio
 * when your agent processes TON blockchain events.
 *
 * Usage:
 *   1. Install a sound pack: mkdir -p ~/.openpeon/packs && download a pack
 *   2. Add this plugin to your Teleton agent config
 *   3. Hear your agent work
 *
 * See https://docs.teletonagent.dev/ for Teleton plugin docs.
 */

import { createCespEmitter } from '../src/cesp-ton';

// Initialize CESP with user-configurable pack and volume
const PACK = process.env.CESP_PACK || 'peon';
const VOLUME = parseFloat(process.env.CESP_VOLUME || '0.5');

const cesp = createCespEmitter({ pack: PACK, volume: VOLUME });

/**
 * Teleton Plugin: CESP Sound Feedback
 *
 * Maps Teleton agent lifecycle events to CESP categories.
 * Adapts to the Teleton plugin SDK interface.
 */
export default {
  name: 'cesp-sounds',
  version: '1.0.0',
  description: 'Audio feedback for TON agent events via CESP',

  /**
   * Called when the plugin is loaded by Teleton.
   * Wires into the agent's event bus.
   */
  init(agent: any) {
    // Agent boots up
    agent.on('ready', () => {
      cesp.emit('session.start');
    });

    // Transaction submitted to mempool
    agent.on('tx:pending', () => {
      cesp.emit('task.acknowledge');
    });

    // Transaction confirmed on-chain
    agent.on('tx:confirmed', () => {
      cesp.emit('task.complete');
    });

    // Transaction failed or contract reverted
    agent.on('tx:failed', (error: any) => {
      cesp.emit('task.error');
    });

    // Agent needs user approval (high-value tx, unknown token, etc.)
    agent.on('approval:required', () => {
      cesp.emit('input.required');
    });

    // RPC rate limit or gas threshold exceeded
    agent.on('ratelimit', () => {
      cesp.emit('resource.limit');
    });

    // Agent shutting down gracefully
    agent.on('shutdown', () => {
      cesp.emit('session.end');
    });

    // Optional: long-running operations (multi-step swaps, etc.)
    agent.on('task:progress', () => {
      cesp.emit('task.progress');
    });
  },
};
