import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { searchMovies, IMG_BASE_URL } from '../services/tmdb-api.js';
import { createClip } from '../services/clips-service.js';
import { extractYoutubeVideoId } from '../utils/youtube.js';

export default function ShareClipModal({ onClose, onCreated }) {
    const { currentUser } = useAuth();
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const videoId = extractYoutubeVideoId(youtubeUrl);

    useEffect(() => {
        if (!query.trim() || selectedMovie) {
            setResults([]);
            return;
        }
        setSearching(true);
        const timeout = setTimeout(() => {
            searchMovies(query)
                .then(data => setResults((data.results ?? []).slice(0, 8)))
                .finally(() => setSearching(false));
        }, 400);
        return () => clearTimeout(timeout);
    }, [query, selectedMovie]);

    function handleChangeQuery(value) {
        setQuery(value);
        if (selectedMovie) setSelectedMovie(null);
    }

    function handleSelectMovie(movie) {
        setSelectedMovie(movie);
        setQuery(movie.title);
        setResults([]);
    }

    async function handleSubmit() {
        if (!videoId || !selectedMovie || !caption.trim() || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            const token = await currentUser.getIdToken();
            const tags = tagsInput
                .split(',')
                .map(t => t.trim())
                .filter(Boolean)
                .map(t => t.startsWith('#') ? t : `#${t}`);

            const { clip } = await createClip(token, {
                youtubeUrl,
                caption: caption.trim(),
                tags,
                tmdbId: selectedMovie.id,
            });
            onCreated(clip);
            onClose();
        } catch {
            setError('Failed to share clip. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const canSubmit = videoId && selectedMovie && caption.trim() && !submitting;

    return (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between px-5 py-4 border-b border-[#2a2a2a]">
                    <h3 className="text-white font-semibold text-sm">Share a Clip</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <p className="text-xs font-medium text-gray-400 mb-2">YouTube Shorts URL</p>
                        <input
                            type="text"
                            value={youtubeUrl}
                            onChange={e => setYoutubeUrl(e.target.value)}
                            placeholder="https://youtube.com/shorts/..."
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-yellow-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder-gray-600"
                        />
                        {youtubeUrl && !videoId && (
                            <p className="text-red-400 text-xs mt-1.5">Doesn't look like a valid YouTube URL.</p>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-400 mb-2">Show / Movie</p>
                        <input
                            type="text"
                            value={query}
                            onChange={e => handleChangeQuery(e.target.value)}
                            placeholder="Search for a show or movie..."
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-yellow-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder-gray-600"
                        />
                        {searching && (
                            <div className="flex justify-center py-2">
                                <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-xs" />
                            </div>
                        )}
                        {results.length > 0 && (
                            <div className="mt-2 space-y-1 max-h-44 overflow-y-auto">
                                {results.map(movie => (
                                    <button
                                        key={movie.id}
                                        onClick={() => handleSelectMovie(movie)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] border border-transparent text-left transition-colors"
                                    >
                                        <div className="w-8 h-11 rounded bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                                            {movie.poster_path && (
                                                <img src={`${IMG_BASE_URL}${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium truncate">{movie.title}</p>
                                            <p className="text-gray-500 text-[10px]">{movie.release_date?.slice(0, 4)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedMovie && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-yellow-500">
                                <i className="fa-solid fa-check" />
                                Selected: {selectedMovie.title}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-400 mb-2">Caption</p>
                        <textarea
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="What's happening in this clip?"
                            rows={2}
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-yellow-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors resize-none placeholder-gray-600"
                        />
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-400 mb-2">
                            Tags <span className="text-gray-600 font-normal">(comma-separated)</span>
                        </p>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                            placeholder="Drama, Iconic, Finale"
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-yellow-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder-gray-600"
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="w-full py-2.5 bg-yellow-500 text-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Share Clip'}
                    </button>
                </div>
            </div>
        </div>
    );
}
