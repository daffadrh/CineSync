import { Router } from "express";
import {requireAuth} from "../middleware/auth.js";
import { getWatchlist, addToWatchlist, updateEntryStatus, removeFromWatchlist } from "../data/watchlist.js";

export const watchlistRouter = Router();

watchlistRouter.use(requireAuth);

watchlistRouter.get('/', async (req, res) => {
    try {
        const watchlist = await getWatchlist(req.user.uid);
        res.json({ watchlist });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

watchlistRouter.post('/', async (req, res) => {
    try {
        const { movieId, title, posterPath, status } = req.body;
        const newEntry = await addToWatchlist(req.user.uid, { movieId, title, posterPath, status });
        res.status(201).json({ entry: newEntry });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add entry to watchlist' });
    }
});

watchlistRouter.patch('/:entryId', async (req, res) => {
    try {
        const entry = await updateEntryStatus(req.user.uid, req.params.entryId, req.body.status);
        res.json({ entry });
    } catch (error) {
        console.error('Error updating watchlist entry:', error);
        res.status(500).json({ error: 'Failed to update watchlist entry' });
    }
});


watchlistRouter.delete('/:entryId', async (req, res) => {
    try {
        await removeFromWatchlist(req.user.uid, req.params.entryId);
        res.status(204).end();
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove entry from watchlist' });
    }
});