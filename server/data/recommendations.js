import { adminDb } from '../firebase-admin.js';

function recommendationsRef() {
    return adminDb.collection('recommendations');
}

export async function sendRecommendation(fromUid, toUids, { movieId, title, posterPath, genres, note }) {
    const recipients = toUids.filter(uid => uid !== fromUid);

    if (recipients.length === 0) {
        throw new Error('No valid recipients');
    }

    const batch = adminDb.batch();
    const createdAt = new Date().toISOString();

    const recommendations = recipients.map(toUid => {
        const ref = recommendationsRef().doc();
        const recommendation = { fromUid, toUid, movieId, title, posterPath, genres, note, createdAt };
        batch.set(ref, recommendation);
        return { id: ref.id, ...recommendation };
    });

    await batch.commit();
    return recommendations;
}

export async function listRecommendations(uid) {
    const snapshot = await recommendationsRef()
                            .where('toUid', '==', uid)
                            .orderBy('createdAt', 'desc')
                            .get();

    if (snapshot.empty) return [];

    const recommendations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const refs = recommendations.map(rec => adminDb.collection('users').doc(rec.fromUid));
    const userDocs = await adminDb.getAll(...refs);

    return recommendations.map((rec, i) => {
        const { username, displayName, avatarUrl } = userDocs[i].data() ?? {};
        return {
            id: rec.id,
            from: { uid: rec.fromUid, username, displayName, avatarUrl },
            movieId: rec.movieId,
            title: rec.title,
            posterPath: rec.posterPath,
            genres: rec.genres,
            note: rec.note,
            createdAt: rec.createdAt,
        };
    });
}

export async function listSentRecommendations(uid) {
    const snapshot = await recommendationsRef()
                            .where('fromUid', '==', uid)
                            .orderBy('createdAt', 'desc')
                            .get();

    if (snapshot.empty) return [];

    const recommendations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const refs = recommendations.map(rec => adminDb.collection('users').doc(rec.toUid));
    const userDocs = await adminDb.getAll(...refs);

    return recommendations.map((rec, i) => {
        const { username, displayName, avatarUrl } = userDocs[i].data() ?? {};
        return {
            id: rec.id,
            to: { uid: rec.toUid, username, displayName, avatarUrl },
            movieId: rec.movieId,
            title: rec.title,
            posterPath: rec.posterPath,
            genres: rec.genres,
            note: rec.note,
            createdAt: rec.createdAt,
        };
    });
}
