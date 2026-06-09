async function authFetch(path, token, options = {}) {
    const res = await fetch(`/api/watchlist${path}`, {
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

export const getWatchlist = (token) =>
    authFetch('/', token);

export const addToWatchlist = (token, { movieId, title, posterPath, backdropPath }) =>
    authFetch('/', token, {
        method: 'POST',
        body: JSON.stringify({ movieId, title, posterPath, backdropPath }),
    });

export const updateStatus = (token, entryId, status) =>
    authFetch(`/${entryId}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });

export const removeFromWatchlist = (token, entryId) =>
    authFetch(`/${entryId}`, token, { method: 'DELETE' });
