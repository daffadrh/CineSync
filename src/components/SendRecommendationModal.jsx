import { useState, useEffect } from 'react';
import { fetchTrending, searchMovies, getMovieDetails, IMG_BASE_URL } from '../services/tmdb-api.js';
import ShareModal from './ShareModal.jsx';

export default function SendRecommendationModal({ onClose }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [selecting, setSelecting] = useState(false);

    const [selectedMovie, setSelectedMovie] = useState(null);
    const [genresString, setGenresString] = useState('');

    useEffect(() => {
        fetchTrending()
            .then(data => setMovies(data.results ?? []))
            .catch(() => setError('Failed to load movies.'))
            .finally(() => setLoading(false));
    }, []);

    async function handleSearch(e) {
        e.preventDefault();
        const q = query.trim();
        setLoading(true);
        setError(null);
        try {
            const data = q ? await searchMovies(q) : await fetchTrending();
            setMovies(data.results ?? []);
            setSubmittedQuery(q);
        } catch {
            setError('Failed to load movies.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSelect(movie) {
        if (selecting) return;
        setSelecting(true);
        try {
            const details = await getMovieDetails(movie.id).catch(() => null);
            const genres = details?.genres?.map(g => g.name) ?? [];
            setGenresString(genres.join(' · '));
            setSelectedMovie(movie);
        } finally {
            setSelecting(false);
        }
    }

    if (selectedMovie) {
        return <ShareModal movie={selectedMovie} genresString={genresString} onClose={onClose} />;
    }

    const sectionTitle = submittedQuery ? `Results for "${submittedQuery}"` : 'Trending This Week';

    return (
        <div
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#141414] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a] flex-shrink-0">
                    <h3 className="text-white font-semibold text-sm">Send a Recommendation</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="px-5 py-3 border-b border-[#2a2a2a] flex-shrink-0">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search for a movie..."
                            autoFocus
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-yellow-500/50 transition-colors placeholder-gray-500"
                        />
                    </div>
                </form>

                {/* Results */}
                <div className="flex-1 overflow-y-auto px-5 py-4 relative min-h-[200px]">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                        {sectionTitle}
                    </p>

                    {loading && (
                        <div className="flex justify-center py-16">
                            <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
                        </div>
                    )}

                    {error && <p className="text-red-400 text-sm text-center py-16">{error}</p>}

                    {!loading && !error && (
                        movies.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-16">No movies found.</p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                {movies.map(movie => (
                                    <PickerMovieCard
                                        key={movie.id}
                                        movie={movie}
                                        onClick={() => handleSelect(movie)}
                                    />
                                ))}
                            </div>
                        )
                    )}

                    {selecting && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <i className="fa-solid fa-circle-notch fa-spin text-yellow-500 text-2xl" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PickerMovieCard({ movie, onClick }) {
    const year = movie.release_date?.slice(0, 4);
    const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;
    const imageUrl = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : null;

    return (
        <div className="group cursor-pointer" onClick={onClick}>
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                {imageUrl
                    ? <img
                        src={imageUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-600 text-2xl" />
                      </div>
                }
            </div>
            <p className="text-white text-sm font-medium truncate">{movie.title}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                {year && <span>{year}</span>}
                {year && rating && <span className="text-gray-600">·</span>}
                {rating && (
                    <span className="flex items-center gap-1 text-yellow-500">
                        <i className="fa-solid fa-star text-[10px]" />
                        {rating}
                    </span>
                )}
            </div>
        </div>
    );
}
