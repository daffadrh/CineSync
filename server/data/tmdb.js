const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchGenres(){
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
    return await res.json();
}

export async function fetchTrending(){
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=2026&sort_by=popularity.desc`);
    return await res.json();
}

export async function fetchByMood(genreId){
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
    return await res.json();
}

export async function searchMovies(query){
    const requests = [];

    for (let page = 1; page <= 5; page++) {
        requests.push(
            fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`)
                .then(res => res.json())
        );
    }
    return await Promise.all(requests);
}

export async function getMovieDetails(id) {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
    return await res.json();
}