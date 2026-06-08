import { adminDb } from '../firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';

function userRef(uid) {
    return adminDb.collection('users').doc(uid);
}

async function generateUniqueUsername(base) {
    let candidate = base;
    let suffix = 1;

    while (true) {
        const exists = await adminDb.collection('users')
                            .where('username', '==', candidate)
                            .limit(1)
                            .get();
        
        if (exists.empty) {
            return candidate;
        }

        suffix++;
        candidate = `${base}${suffix}`;
    }
}

export async function getOrCreateUser(uid, { email, name} ) {
    const ref = userRef(uid);
    const doc = await ref.get();

    if (doc.exists) {
        return { id: doc.id, ...doc.data() };
    }

    const base = (email ? email.split('@')[0] : uid).toLowerCase();
    const username = await generateUniqueUsername(base);

    const newUser = {
        username: username,
        email: email || null,
        displayName: name || null,
        avatarUrl: null,
        bio: null,
        joinedAt: new Date().toISOString(),
        friendIds: [],
    };

    await ref.set(newUser);
    return { id: ref.id, ...newUser };
}

const EDITABLE_FIELDS = ['displayName', 'username', 'avatarUrl', 'bio'];

export async function updateUser(uid, updates) {
    const ref = userRef(uid);
    const doc = await ref.get();

    if (!doc.exists) {
        throw new Error('User not found');
    }

    const changes = {};

    for (const field of EDITABLE_FIELDS) {
        if (updates[field] !== undefined) {
            changes[field] = updates[field];
        }
    }

    if (changes.username) {
        changes.username = changes.username.toLowerCase();
    }
    
    const currentUsername = doc.data().username;
    if (changes.username && changes.username !== currentUsername) {
        const exists = await adminDb.collection('users')
                            .where('username', '==', changes.username)
                            .limit(1)
                            .get();
        if (!exists.empty) {
            throw new Error('Username already taken');
        }
    }

    await ref.update(changes);
    return { id: doc.id, ...doc.data(), ...changes };
}

export async function getUserById(uid) {
    const doc = await userRef(uid).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export async function getUserPublic(id) {
    const user = await getUserById(id);
    if (!user) return null;

    const { email, friendIds, ...publicFields } = user;
    return publicFields;
}

export async function getFriends(uid) {
    const user = await getUserById(uid);
    if (!user || user.friendIds.length === 0) return [];

    const refs = user.friendIds.map(friendId => userRef(friendId));
    const docs = await adminDb.getAll(...refs);

    return docs 
           .filter(doc => doc.exists)
           .map(doc => {
                const { email, friendIds, ...rest } = doc.data();
                return { id: doc.id, ...rest };
            });
}

export async function removeFriend(uid, friendId) {
    const ownRef = userRef(uid);
    const friendRef = userRef(friendId);

    const [outgoing, incoming] = await Promise.all([
        adminDb.collection('friendRequests')
               .where('fromUid', '==', uid)
               .where('toUid', '==', friendId)
               .where('status', '==', 'accepted')
               .orderBy('createdAt', 'desc')
               .limit(1)
               .get(),
        adminDb.collection('friendRequests')
               .where('fromUid', '==', friendId)
               .where('toUid', '==', uid)
               .where('status', '==', 'accepted')
               .orderBy('createdAt', 'desc')
               .limit(1)
               .get(),
    ]);

    const requestDoc = !outgoing.empty ? outgoing.docs[0]
                     : !incoming.empty ? incoming.docs[0]
                     : null;

    const batch = adminDb.batch();

    batch.update(ownRef, { friendIds: FieldValue.arrayRemove(friendId) });
    batch.update(friendRef, { friendIds: FieldValue.arrayRemove(uid) });

    if (requestDoc) {
        batch.update(requestDoc.ref, {
            status: 'removed',
            resolvedAt: new Date().toISOString(),
        });
    }

    await batch.commit();
}

export async function searchUsersByUsername(prefix) {
    const snapshot = await adminDb.collection('users')
                                  .where('username', '>=', prefix)
                                  .where('username', '<', prefix + '\uf8ff')
                                  .limit(10)
                                  .get();
    
    return snapshot.docs.map(doc => {
        const { username, displayName, avatarUrl } = doc.data();
        return {uid: doc.id, username, displayName, avatarUrl};
    });
}