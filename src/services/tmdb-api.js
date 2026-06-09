export const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function apiFetch(path) {
    const res = await fetch(`/api/movies${path}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export const fetchTrending  = ()           => apiFetch('/trending');
export const fetchGenres    = ()           => apiFetch('/genres');
export const fetchByMood    = (genreId)    => apiFetch(`/mood/${genreId}`);
export const searchMovies   = (query)      => apiFetch(`/search?q=${encodeURIComponent(query)}`);
export const getMovieDetails = (movieId)  => apiFetch(`/${movieId}`);
