import { MOCK_WATCHLIST } from './clips-data.js';

// In-memory working copy so the UI can mutate without touching the canonical mock export.
// Swap these for real `fetch('/api/watchlist', ...)` calls in Phase 4 — same async signatures.
let watchlist = MOCK_WATCHLIST.map(entry => ({ ...entry }));

export async function getWatchlist() {
    return [...watchlist];
}

export async function updateWatchlistStatus(entryId, status) {
    const entry = watchlist.find(e => e.id === entryId);
    if (entry) entry.status = status;
    return entry ? { ...entry } : null;
}

export async function removeFromWatchlist(entryId) {
    watchlist = watchlist.filter(e => e.id !== entryId);
    return { removed: entryId };
}
