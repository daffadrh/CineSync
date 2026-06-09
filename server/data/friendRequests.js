import { adminDb } from '../firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';

const FRIEND_REQUEST_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export async function sendFriendRequest(fromUid, toUid) {
    if (fromUid === toUid) {
        throw new Error('Cannot send a friend request to yourself');
    }

    const [outgoing, incoming] = await Promise.all([
        adminDb.collection('friendRequests')
               .where('fromUid', '==', fromUid)
               .where('toUid', '==', toUid)
               .orderBy('createdAt', 'desc')
               .limit(1)
               .get(),
        adminDb.collection('friendRequests')
               .where('fromUid', '==', toUid)
               .where('toUid', '==', fromUid)
               .orderBy('createdAt', 'desc')
               .limit(1)
               .get(),
    ]);

    for (const snapshot of [outgoing, incoming]) {
        if (snapshot.empty) continue;
        const existing = snapshot.docs[0].data();

        if (existing.status === 'pending') {
            throw new Error('Friend request already pending');
        }
        if (existing.status === 'accepted') {
            throw new Error('Already friends');
        }
        if (existing.status === 'rejected' || existing.status === 'removed') {
            const elapsed = Date.now() - new Date(existing.resolvedAt).getTime();
            if (elapsed < FRIEND_REQUEST_COOLDOWN_MS) {
                throw new Error('Must wait before sending another request');
            }
        }
    }

    const ref = await adminDb.collection('friendRequests').add({
        fromUid,
        toUid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        resolvedAt: null,
    });

    return { id: ref.id, fromUid, toUid, status: 'pending' };
}

export async function listFriendRequests(uid) {
    const snapshot = await adminDb.collection('friendRequests')
                                  .where('toUid', '==', uid)
                                  .where('status', '==', 'pending')
                                  .orderBy('createdAt', 'desc')
                                  .get();

    if (snapshot.empty) return [];

    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const refs = requests.map(request => adminDb.collection('users').doc(request.fromUid));
    const userDocs = await adminDb.getAll(...refs);

    return requests.map((request, i) => {
        const { username, displayName, avatarUrl } = userDocs[i].data() ?? {};
        return {
            id: request.id,
            from: { uid: request.fromUid, username, displayName, avatarUrl },
            createdAt: request.createdAt,
        };
    });
}

export async function acceptFriendRequest(requestId, uid) {
    const requestRef = adminDb.collection('friendRequests').doc(requestId);

    await adminDb.runTransaction(async (transaction) => {
        const requestDoc = await transaction.get(requestRef);

        if (!requestDoc.exists) {
            throw new Error('Friend request not found');
        }

        const request = requestDoc.data();

        if (request.toUid !== uid) {
            throw new Error('Not authorized to accept this request');
        }
        if (request.status !== 'pending') {
            throw new Error('Friend request is no longer pending');
        }

        const fromRef = adminDb.collection('users').doc(request.fromUid);
        const toRef = adminDb.collection('users').doc(request.toUid);

        transaction.update(requestRef, {
            status: 'accepted',
            resolvedAt: new Date().toISOString(),
        });
        transaction.update(fromRef, {
            friendIds: FieldValue.arrayUnion(request.toUid),
        });
        transaction.update(toRef, {
            friendIds: FieldValue.arrayUnion(request.fromUid),
        });
    });
}

export async function listOutgoingFriendRequests(uid) {
    const snapshot = await adminDb.collection('friendRequests')
                                  .where('fromUid', '==', uid)
                                  .where('status', '==', 'pending')
                                  .get();
    return snapshot.docs.map(doc => doc.data().toUid);
}

export async function rejectFriendRequest(requestId, uid) {
    const ref = adminDb.collection('friendRequests').doc(requestId);
    const doc = await ref.get();

    if (!doc.exists) {
        throw new Error('Friend request not found');
    }

    const request = doc.data();

    if (request.toUid !== uid) {
        throw new Error('Not authorized to reject this request');
    }
    if (request.status !== 'pending') {
        throw new Error('Friend request is no longer pending');
    }

    await ref.update({
        status: 'rejected',
        resolvedAt: new Date().toISOString(),
    });
}
