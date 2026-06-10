import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { sendRecommendation, listRecommendations, listSentRecommendations } from "../data/recommendations.js";

export const recommendationsRouter = Router();

recommendationsRouter.use(requireAuth);

recommendationsRouter.get('/', async (req, res) => {
    try {
        const recommendations = await listRecommendations(req.user.uid);
        res.json({ recommendations });
    } catch (error) {
        console.error('Error listing recommendations:', error);
        res.status(500).json({ error: 'Failed to list recommendations' });
    }
});

recommendationsRouter.get('/sent', async (req, res) => {
    try {
        const recommendations = await listSentRecommendations(req.user.uid);
        res.json({ recommendations });
    } catch (error) {
        console.error('Error listing sent recommendations:', error);
        res.status(500).json({ error: 'Failed to list sent recommendations' });
    }
});

recommendationsRouter.post('/', async (req, res) => {
    try {
        const { toUids, movieId, title, posterPath, genres, note } = req.body;

        if (!Array.isArray(toUids) || toUids.length === 0) {
            return res.status(400).json({ error: 'Missing recipients' });
        }
        if (!movieId || !title) {
            return res.status(400).json({ error: 'Missing movie details' });
        }

        const recommendations = await sendRecommendation(req.user.uid, toUids, { movieId, title, posterPath, genres, note });
        res.status(201).json({ recommendations });
    } catch (error) {
        if (error.message === 'No valid recipients') {
            return res.status(400).json({ error: error.message });
        }
        console.error('Error sending recommendation:', error);
        res.status(500).json({ error: 'Failed to send recommendation' });
    }
});
