
'use client';

/**
 * THIS FILE IS NOW A STUB.
 * The core client-side workflow logic has been moved to the standalone /public/workflow-tracker.js script.
 * This file is maintained to prevent breaking old imports, but its functionality is now deprecated.
 * The preview page now directly uses the modular tracker system for a more accurate simulation.
 */

console.warn("The workflow-engine.ts is deprecated. Logic has moved to public/workflow-tracker.js.");

// No-op function to avoid breaking imports.
export function runSingleWorkflow(): () => void {
  return () => {};
}
