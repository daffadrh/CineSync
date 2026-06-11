import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { getClips, getClipById, getComments, createClip, toggleSave, createComment } from '../data/clips.js';
import { extractYoutubeVideoId } from '../utils/youtube.js';
import { getMovieDetails } from '../data/tmdb.js';
import { getOrCreateUser } from '../data/users.js';

export const clipsRouter = Router();

clipsRouter.get('/', optionalAuth, async (req, res) => {
    const { filter = 'all', page = '1' } = req.query;

    if ((filter === 'watchlist' || filter === 'saved') && !req.user) {
        return res.status(401).json({ error: 'Authentication required for ' + filter + ' filter' });
    }

    try {
        const result = await getClips({ filter, page: Number(page), uid: req.user?.uid });
        res.json(result);
    } catch (error) {
        console.error('Error fetching clips:', error);
        res.status(500).json({ error: 'Failed to fetch clips' });
    }
});

clipsRouter.get('/:id', optionalAuth, async (req, res) => {
    try {
        const clip = await getClipById(req.params.id, req.user?.uid);
        if (!clip) {
            return res.status(404).json({ error: 'Clip not found' });
        }
        res.json(clip);
    } catch (error) {
        console.error('Error fetching clip:', error);
        res.status(500).json({ error: 'Failed to fetch clip' });
    }
});

clipsRouter.get('/:id/comments', async (req, res) => {
    try {
        const comments = await getComments(req.params.id);
        res.json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

clipsRouter.post('/', requireAuth, async (req, res) => {
    const { youtubeUrl, caption, tags, tmdbId } = req.body;

    if (!extractYoutubeVideoId(youtubeUrl)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const movie = await getMovieDetails(tmdbId);
        const show = {
            tmdbId: movie.id,
            name: movie.title,
            description: movie.overview,
            genres: (movie.genres ?? []).map(g => g.name),
            rating: movie.vote_average,
        };

        const clip = await createClip({ authorId: req.user.uid, youtubeUrl, caption, tags, show });
        res.status(201).json({ clip });
    } catch (error) {
        console.error('Error creating clip:', error);
        res.status(500).json({ error: 'Failed to create clip' });
    }
});

clipsRouter.post('/:id/save', requireAuth, async (req, res) => {
    try {
        const result = await toggleSave(req.params.id, req.user.uid);
        res.json(result);
    } catch (error) {
        console.error('Error toggling save:', error);
        res.status(500).json({ error: 'Failed to toggle save' });
    }
});

clipsRouter.post('/:id/comments', requireAuth, async (req, res) => {
    const { text, parentId } = req.body;

    try {
        const profile = await getOrCreateUser(req.user.uid, { email: req.user.email, name: req.user.name });
        const comment = await createComment(req.params.id, {
            authorId: req.user.uid,
            authorName: `@${profile.username}`,
            authorInitials: (profile.displayName ?? profile.username)[0].toUpperCase(),
            text,
            parentId,
        });
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});