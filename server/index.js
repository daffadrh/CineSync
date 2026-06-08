import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { requireAuth } from './middleware/auth.js';

import { watchlistRouter } from './routes/watchlist.js';
import { movieRouter } from './routes/tmdb.js';
import { usersRouter } from './routes/users.js';
import { recommendationsRouter } from './routes/recommendations.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/watchlist', watchlistRouter);
app.use('/api/movies', movieRouter);
app.use('/api/users', usersRouter);
app.use('/api/recommendations', recommendationsRouter);

app.listen(port, () => {
    console.log(`CineSync API is running on port ${port}`);
});