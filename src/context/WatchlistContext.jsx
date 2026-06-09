import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
    getWatchlist,
    addToWatchlist as apiAdd,
    updateStatus as apiUpdateStatus,
    removeFromWatchlist as apiRemove,
} from '../services/watchlist-service.js';

const WatchlistContext = createContext(null);

export const STATUSES = ['planned', 'watching', 'completed', 'dropped'];

export const STATUS_LABELS = {
    planned:   'Planned',
    watching:  'Watching',
    completed: 'Completed',
    dropped:   'Dropped',
};

export const STATUS_COLORS = {
    planned:   'text-gray-400 bg-[#1f1f1f] border border-[#2a2a2a]',
    watching:  'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20',
    completed: 'text-green-400 bg-green-500/10 border border-green-500/20',
    dropped:   'text-red-400 bg-red-500/10 border border-red-500/20',
};

export function WatchlistProvider({ children }) {
    const { currentUser } = useAuth();
    const [watchlistMap, setWatchlistMap] = useState(new Map());
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setWatchlistMap(new Map());
            setLoaded(false);
            return;
        }
        setLoaded(false);
        currentUser.getIdToken()
            .then(token => getWatchlist(token))
            .then(data => {
                const map = new Map(data.watchlist.map(e => [e.movieId, e]));
                setWatchlistMap(map);
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, [currentUser]);

    async function add(movie) {
        const token = await currentUser.getIdToken();
        const data = await apiAdd(token, {
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path ?? null,
            backdropPath: movie.backdrop_path ?? null,
        });
        setWatchlistMap(prev => new Map(prev).set(data.entry.movieId, data.entry));
    }

    async function changeStatus(movieId, status) {
        const entry = watchlistMap.get(movieId);
        if (!entry) return;
        const token = await currentUser.getIdToken();
        const data = await apiUpdateStatus(token, entry.id, status);
        setWatchlistMap(prev => new Map(prev).set(movieId, data.entry));
    }

    async function remove(movieId) {
        const entry = watchlistMap.get(movieId);
        if (!entry) return;
        const token = await currentUser.getIdToken();
        await apiRemove(token, entry.id);
        setWatchlistMap(prev => {
            const next = new Map(prev);
            next.delete(movieId);
            return next;
        });
    }

    return (
        <WatchlistContext.Provider value={{ watchlistMap, loaded, add, changeStatus, remove }}>
            {children}
        </WatchlistContext.Provider>
    );
}

export function useWatchlist() {
    return useContext(WatchlistContext);
}
