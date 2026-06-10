import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logoutUser } from '../services/auth.js';

export default function Header() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const initial = currentUser?.displayName?.[0]?.toUpperCase() ?? null;
    const [query, setQuery] = useState('');

    function handleSearch(e) {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            navigate(`/discover?q=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/discover');
        }
    }

    async function handleLogout() {
        await logoutUser();
        navigate('/login');
    }

    return (
        <header className="h-16 flex items-center px-8 bg-[#0d0d0d] border-b border-[#1a1a1a] flex-shrink-0">
            <div className="flex-1" />

            <form onSubmit={handleSearch} className="w-full max-w-lg">
                <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search movies..."
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-yellow-500/50 transition-colors placeholder-gray-500"
                    />
                </div>
            </form>

            <div className="flex-1 flex justify-end items-center gap-3">
                <button
                    onClick={() => navigate('/friends')}
                    title="Friends"
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                    <i className="fa-solid fa-user-group text-sm" />
                </button>
                <div
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border border-[#333] cursor-pointer flex-shrink-0"
                >
                    {initial
                        ? <span className="text-white font-semibold text-sm">{initial}</span>
                        : <i className="fa-solid fa-user text-gray-300" />
                    }
                </div>
                <button
                    onClick={handleLogout}
                    title="Log out"
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                    <i className="fa-solid fa-arrow-right-from-bracket text-sm" />
                </button>
            </div>
        </header>
    );
}
