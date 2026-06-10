const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const CERTIFICATION_COUNTRY = 'US';
const MAX_CERTIFICATION = 'PG-13';

const MIN_VOTE_COUNT = 30;

const EXCLUDED_KEYWORDS = [
    256466, // erotic
    325693, // erotica
    155477, // softcore
    354470, // sex scene
    347060, // explicite sex
    298666, // erotic romance
    302868, // erotic comedy
    281741, // nudity
    360081, // partial nudity
    359980, // female nudity
    359981, // female frontal nudity
    367629, // male frontal nudity
].join(',');

const SAFE_DISCOVER_PARAMS = `include_adult=false&certification_country=${CERTIFICATION_COUNTRY}&certification.lte=${MAX_CERTIFICATION}&vote_count.gte=${MIN_VOTE_COUNT}&without_keywords=${EXCLUDED_KEYWORDS}`;

export async function fetchGenres(){
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
    return await res.json();
}

export async function fetchTrending(){
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=2026&sort_by=popularity.desc&${SAFE_DISCOVER_PARAMS}`);
    return await res.json();
}

export async function fetchByMood(genreId){
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&${SAFE_DISCOVER_PARAMS}`);
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