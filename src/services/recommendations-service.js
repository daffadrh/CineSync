async function authFetch(path, token, options = {}) {
    const res = await fetch(`/api/recommendations${path}`, {
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

export const getRecommendations = (token) =>
    authFetch('/', token);

export const getSentRecommendations = (token) =>
    authFetch('/sent', token);

export const sendRecommendation = (token, { toUids, movieId, title, posterPath, genres, note }) =>
    authFetch('/', token, {
        method: 'POST',
        body: JSON.stringify({ toUids, movieId, title, posterPath, genres, note }),
    });
