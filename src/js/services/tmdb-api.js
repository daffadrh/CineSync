const TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; 
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const IMG_ORIGINAL_URL = 'https://image.tmdb.org/t/p/original';

export async function fetchGenresAPI() {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
    return await res.json();
}

export async function fetchTrendingAPI() {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=2026&sort_by=popularity.desc`);
    return await res.json();
}

export async function fetchByMoodAPI(genreId) {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
    return await res.json();
}

export async function searchMoviesAPI(query) {
    const promises = [];
    for(let i=1; i<=5; i++) {
        promises.push(fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${i}`).then(res => res.json()));
    }
    return await Promise.all(promises);
}

export async function getMovieDetails(id) {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
    return await res.json();
}