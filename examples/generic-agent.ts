/**
 * CESP + TON Agent: Generic Example
 *
 * Shows how to wire CESP audio feedback into any Node.js-based
 * TON agent, regardless of framework.
 */

import { createCespEmitter } from '../src/cesp-ton';

// --- CESP setup (one-time) ---

const cesp = createCespEmitter({
  pack: process.env.CESP_PACK || 'peon',
  volume: parseFloat(process.env.CESP_VOLUME || '0.5'),
});

// --- Your agent code ---

async function main() {
  // Agent boots
  cesp.emit('session.start');

  try {
    // Simulate: submit a transaction
    console.log('Submitting transaction...');
    cesp.emit('task.acknowledge');

    // Simulate: wait for confirmation
    await new Promise((r) => setTimeout(r, 2000));

    // Transaction confirmed
    console.log('Transaction confirmed!');
    cesp.emit('task.complete');

  } catch (err) {
    // Transaction failed
    console.error('Transaction failed:', err);
    cesp.emit('task.error');
  }

  // Agent shuts down
  cesp.emit('session.end');
}

main();
