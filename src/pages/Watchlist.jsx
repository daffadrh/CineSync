import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist, STATUSES, STATUS_LABELS, STATUS_COLORS } from '../context/WatchlistContext.jsx';
import { IMG_BASE_URL } from '../services/tmdb-api.js';
import MovieModal from '../components/MovieModal.jsx';

const FILTERS = ['all', ...STATUSES];
const FILTER_LABELS = { all: 'All', ...STATUS_LABELS };

export default function Watchlist() {
    const navigate = useNavigate();
    const { watchlistMap, loaded } = useWatchlist();
    const [filter, setFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);

    const items = [...watchlistMap.values()];
    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    const counts = {
        all: items.length,
        ...Object.fromEntries(STATUSES.map(s => [s, items.filter(i => i.status === s).length])),
    };

    const modalMovie = selectedItem ? {
        id: selectedItem.movieId,
        title: selectedItem.title,
        poster_path: selectedItem.posterPath,
        backdrop_path: selectedItem.backdropPath ?? null,
        vote_average: 0,
        release_date: '',
        overview: '',
    } : null;

    return (
        <div className="px-8 py-8">
        <div className="max-w-screen-xl mx-auto">
            <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Your collection</p>
                <h1 className="text-4xl font-serif font-bold text-white">
                    My <span className="italic text-yellow-500">Watchlist</span>.
                </h1>
            </div>

            <div className="flex gap-2 mb-8 flex-wrap">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filter === f
                                ? 'bg-yellow-500 text-black'
                                : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222]'
                        }`}
                    >
                        {FILTER_LABELS[f]}
                        <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                            filter === f ? 'bg-black/20 text-black' : 'bg-[#2a2a2a] text-gray-500'
                        }`}>
                            {counts[f]}
                        </span>
                    </button>
                ))}
            </div>

            {!loaded && (
                <div className="flex justify-center py-20">
                    <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
                </div>
            )}

            {loaded && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <i className="fa-regular fa-compass text-gray-700 text-5xl mb-4" />
                    <p className="text-gray-400 text-sm">
                        {filter === 'all' ? 'Your watchlist is empty.' : `No ${filter} titles yet.`}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => navigate('/discover')}
                            className="mt-4 text-yellow-500 text-sm hover:text-yellow-400 transition-colors font-medium"
                        >
                            Explore movies →
                        </button>
                    )}
                </div>
            )}

            {loaded && filtered.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map(item => (
                        <WatchlistCard
                            key={item.id}
                            item={item}
                            onClick={() => setSelectedItem(item)}
                        />
                    ))}
                </div>
            )}

            {modalMovie && (
                <MovieModal movie={modalMovie} onClose={() => setSelectedItem(null)} />
            )}
        </div>
        </div>
    );
}

function WatchlistCard({ item, onClick }) {
    const imageUrl = item.posterPath ? `${IMG_BASE_URL}${item.posterPath}` : null;

    return (
        <div className="cursor-pointer" onClick={onClick}>
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                {imageUrl
                    ? <img src={imageUrl} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-600 text-2xl" />
                      </div>
                }
            </div>

            <p className="text-white text-sm font-medium truncate">{item.title}</p>
            <span className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                {STATUS_LABELS[item.status]}
            </span>
        </div>
    );
}
