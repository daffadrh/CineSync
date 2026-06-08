import { Router } from "express";
// import {requireAuth} from "../middleware/auth.js";
import { fetchGenres, fetchTrending, fetchByMood, searchMovies, getMovieDetails } from "../data/tmdb.js";

export const movieRouter = Router();

// movieRouter.use(requireAuth);

movieRouter.get('/genres', async (req, res) => {
    try {
        const genres = await fetchGenres();
        res.json(genres);
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

movieRouter.get('/trending', async (req, res) => {
    try {
        const movies = await fetchTrending();
        res.json(movies);
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
});

movieRouter.get('/mood/:genreId', async (req, res) => {
    try {
        const movies = await fetchByMood(req.params.genreId);
        res.json(movies);
    } catch (error) {
        console.error('Error fetching movies by mood:', error);
        res.status(500).json({ error: 'Failed to fetch movies by mood' });
    }
});


movieRouter.get('/search', async (req, res) => {
    try {
        const pages = await searchMovies(req.query.q);
        let results = [];
        pages.forEach(p => { if (p.results) results = results.concat(p.results); });
        const unique = Array.from(new Set(results.map(r => r.id))).map(id => results.find(r => r.id === id));
        res.json({ results: unique });
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ error: 'Failed to search movies' });
    }
});

movieRouter.get('/:movieId', async (req, res) => {
    try {
        const movie = await getMovieDetails(req.params.movieId);
        res.json(movie);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});