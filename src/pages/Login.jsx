import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, loginWithGoogle } from '../services/auth.js';

function friendlyAuthError(error) {
    switch (error.code) {
        case 'auth/invalid-email': return 'That email address looks invalid.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return 'Incorrect email or password.';
        case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
        default: return 'Something went wrong. Please try again.';
    }
}

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginUser(email, password);
            navigate('/discover');
        } catch (err) {
            setError(friendlyAuthError(err));
            setLoading(false);
        }
    }

    async function handleGoogle() {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/discover');
        } catch (err) {
            setError(friendlyAuthError(err));
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/discover" className="inline-block transition-transform hover:scale-105">
                        <h1 className="text-4xl font-serif font-bold italic tracking-wide text-white">CineSync</h1>
                    </Link>
                    <p className="text-sm text-gray-500 mt-2">Welcome back. Let's pick up where you left off.</p>
                </div>

                <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-3
outline-none transition-colors placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-3
outline-none transition-colors placeholder-gray-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg
transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><i className="fa-solid fa-circle-notch fa-spin" /> Logging in…</>
                            ) : 'Log In'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-[#2a2a2a]" />
                        <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-[#2a2a2a]" />
                    </div>

                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-60 disabled:cursor-not-allowed border
border-[#333] text-white text-sm font-semibold py-3 rounded-lg transition-colors"
                    >
                        <i className="fa-brands fa-google" /> Continue with Google
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}