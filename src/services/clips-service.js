async function apiFetch(path, { token, ...options } = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/clips${path}`, { ...options, headers });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export const getClips = (filter = 'all', page = 1, token) =>
    apiFetch(`?filter=${filter}&page=${page}`, { token });

export const getClip = (id, token) =>
    apiFetch(`/${id}`, { token });

export const getComments = (id) =>
    apiFetch(`/${id}/comments`);

export const toggleSave = (token, id) =>
    apiFetch(`/${id}/save`, { token, method: 'POST' });

export const postComment = (token, id, { text, parentId = null }) =>
    apiFetch(`/${id}/comments`, {
        token,
        method: 'POST',
        body: JSON.stringify({ text, parentId }),
    });

export const createClip = (token, { youtubeUrl, caption, tags, tmdbId }) =>
    apiFetch('/', {
        token,
        method: 'POST',
        body: JSON.stringify({ youtubeUrl, caption, tags, tmdbId }),
    });
