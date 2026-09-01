/**
 * Roast Arena Real-Time Viewer Presence Engine
 * Tracks active unique viewers on the battle page in real-time.
 */

declare global {
  // eslint-disable-next-line no-var
  var __coroast_active_viewers: Map<string, number> | undefined;
}

if (!global.__coroast_active_viewers) {
  global.__coroast_active_viewers = new Map<string, number>();
}

const activeViewers = global.__coroast_active_viewers;

// Viewers who have sent a heartbeat within the last 60 seconds are considered active
const PRESENCE_TIMEOUT_MS = 60 * 1000;

function pruneStaleViewers() {
  const cutoff = Date.now() - PRESENCE_TIMEOUT_MS;
  for (const [key, lastSeen] of activeViewers.entries()) {
    if (lastSeen < cutoff) {
      activeViewers.delete(key);
    }
  }
}

/**
 * Records or refreshes the presence of an active viewer
 * @param viewerKey Unique user ID, session token, or hashed IP
 * @returns Current real-time count of active viewers
 */
export function recordViewerPresence(viewerKey: string): number {
  pruneStaleViewers();
  if (viewerKey) {
    activeViewers.set(viewerKey, Date.now());
  }
  return Math.max(1, activeViewers.size);
}

/**
 * Gets the current real-time count of active viewers watching the battle
 */
export function getActiveViewersCount(): number {
  pruneStaleViewers();
  return Math.max(1, activeViewers.size);
}
