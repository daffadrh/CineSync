async function authFetch(path, token, options = {}) {
    const res = await fetch(`/api/users${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export const getMyProfile = (token) =>
    authFetch('/me', token);

export const updateProfile = (token, { displayName, username, bio, avatarUrl }) =>
    authFetch('/me', token, {
        method: 'PATCH',
        body: JSON.stringify({ displayName, username, bio, avatarUrl }),
    });

export const getFriends = (token, uid) =>
    authFetch(`/${uid}/friends`, token);

export const getFriendRequests = (token) =>
    authFetch('/me/friend-requests', token);

export const sendFriendRequest = (token, toUid) =>
    authFetch('/me/friend-requests', token, {
        method: 'POST',
        body: JSON.stringify({ toUid }),
    });

export const acceptFriendRequest = (token, requestId) =>
    authFetch(`/me/friend-requests/${requestId}/accept`, token, { method: 'POST' });

export const rejectFriendRequest = (token, requestId) =>
    authFetch(`/me/friend-requests/${requestId}/reject`, token, { method: 'POST' });

export const removeFriend = (token, friendId) =>
    authFetch(`/me/friends/${friendId}`, token, { method: 'DELETE' });

export const getOutgoingFriendRequests = (token) =>
    authFetch('/me/friend-requests/outgoing', token);

export const searchUsers = (token, q) =>
    authFetch(`/search?q=${encodeURIComponent(q)}`, token);
