import { adminDb } from '../firebase-admin.js';
import { getWatchlist } from './watchlist.js';
import { FieldValue } from 'firebase-admin/firestore';

const PAGE_SIZE = 10;

function clipsRef() {
    return adminDb.collection('clips');
}

function commentsRef(clipId) {
    return clipsRef().doc(clipId).collection('comments');
}

export async function getClips({ filter = 'all', page = 1, uid } = {}) {
    let query;

    if (filter === 'saved') {
        if (!uid) return { items: [], page, hasMore: false };

        const start = (page - 1) * PAGE_SIZE;
        const savesSnapshot = await adminDb.collection('users').doc(uid).collection('saves')
            .orderBy('savedAt', 'desc')
            .offset(start)
            .limit(PAGE_SIZE + 1)
            .get();

        const saveDocs = savesSnapshot.docs.map(doc => doc.data());
        const hasMore = saveDocs.length > PAGE_SIZE;
        const clipIds = saveDocs.slice(0, PAGE_SIZE).map(d => d.clipId);

        if (clipIds.length === 0) {
            return { items: [], page, hasMore: false };
        }

        const clipDocs = await adminDb.getAll(...clipIds.map(id => clipsRef().doc(id)));
        const clipsById = new Map(clipDocs.filter(d => d.exists).map(d => [d.id, { id: d.id, ...d.data() }]));
        const items = clipIds.map(id => clipsById.get(id)).filter(Boolean);

        return { items, page, hasMore };
    }

    if (filter === 'trending') {
        query = clipsRef().orderBy('saveCount', 'desc');
    } else if (filter === 'watchlist') {
        const watchlist = await getWatchlist(uid);
        const tmdbIds = [...new Set(watchlist.map(entry => entry.movieId))].slice(0, 10);

        if (tmdbIds.length === 0) {
            return { items: [], page, hasMore: false };
        }

        query = clipsRef().where('show.tmdbId', 'in', tmdbIds).orderBy('createdAt', 'desc');
    } else {
        query = clipsRef().orderBy('createdAt', 'desc');
    }

    const start = (page - 1) * PAGE_SIZE;
    const snapshot = await query.offset(start).limit(PAGE_SIZE + 1).get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const hasMore = docs.length > PAGE_SIZE;
    const items = docs.slice(0, PAGE_SIZE);

    return { items, page, hasMore };
}

export async function getClipById(clipId, uid) {
    const doc = await clipsRef().doc(clipId).get();
    if (!doc.exists) return null;

    const clip = { id: doc.id, ...doc.data() };
    clip.comments = await getComments(clipId);

    if (uid) {
        const saveDoc = await adminDb.collection('users').doc(uid).collection('saves').doc(clipId).get();
        clip.saved = saveDoc.exists;
    } else {
        clip.saved = false;
    }

    return clip;
}

export async function getComments(clipId) {
    const snapshot = await commentsRef(clipId).orderBy('createdAt', 'asc').get();
    const flat = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), replies: [] }));

    const byId = new Map(flat.map(comment => [comment.id, comment]));
    const roots = [];

    for (const comment of flat) {
        if (comment.parentId && byId.has(comment.parentId)) {
            byId.get(comment.parentId).replies.push(comment);
        } else {
            roots.push(comment);
        }
    }

    return roots;
}

export async function createClip({ authorId, youtubeUrl, caption, tags, show }) {
    const ref = await clipsRef().add({
        authorId,
        youtubeUrl,
        caption,
        tags: tags ?? [],
        gradientClass: null,
        show,
        commentCount: 0,
        saveCount: 0,
        createdAt: new Date().toISOString(),
    });

    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
}

export async function toggleSave(clipId, uid) {
    const saveRef = adminDb.collection('users').doc(uid).collection('saves').doc(clipId);
    const clipRef = clipsRef().doc(clipId);

    return adminDb.runTransaction(async (tx) => {
        const [saveDoc, clipDoc] = await Promise.all([tx.get(saveRef), tx.get(clipRef)]);
        const saveCount = clipDoc.data()?.saveCount ?? 0;

        if (saveDoc.exists) {
            tx.delete(saveRef);
            tx.update(clipRef, { saveCount: saveCount - 1 });
            return { saved: false, saveCount: saveCount - 1 };
        }

        tx.set(saveRef, { clipId, savedAt: new Date().toISOString() });
        tx.update(clipRef, { saveCount: saveCount + 1 });
        return { saved: true, saveCount: saveCount + 1 };
    });
}

export async function createComment(clipId, { authorId, authorName, authorInitials, text, parentId = null }) {
    const ref = await commentsRef(clipId).add({
        authorId,
        authorName,
        authorInitials,
        text,
        parentId,
        createdAt: new Date().toISOString(),
    });

    await clipsRef().doc(clipId).update({ commentCount: FieldValue.increment(1) });

    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
}