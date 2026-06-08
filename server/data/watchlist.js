import { adminDb } from '../firebase-admin.js';

function watchlistRef(uid) {
    return adminDb.collection('users').doc(uid).collection('watchlist');
}

export async function getWatchlist(uid) {
    const snapshot = await watchlistRef(uid).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addToWatchlist(uid, { movieId, title, posterPath, status = 'planned' } ) {
    const ref = await watchlistRef(uid).add({
        movieId,
        title,
        posterPath,
        status,
        addedAt: new Date().toISOString(),
    });

    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
}

export async function updateEntryStatus(uid, entryId, status) {
    const ref = watchlistRef(uid).doc(entryId);
    await ref.update({ status });

    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
}

export async function removeFromWatchlist(uid, entryId) {
    await watchlistRef(uid).doc(entryId).delete();
}
