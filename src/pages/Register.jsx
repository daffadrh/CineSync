import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginWithGoogle } from '../services/auth.js';

function friendlyAuthError(error) {
    switch (error.code) {
        case 'auth/invalid-email': return 'That email address looks invalid.';
        case 'auth/email-already-in-use': return 'An account with this email already exists.';
        case 'auth/weak-password': return 'Please choose a password with at least 6 characters.';
        case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
        default: return 'Something went wrong. Please try again.';
    }
}

export default function Register() {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await registerUser(email, password, displayName);
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
                    {/* <p className="text-sm text-gray-500 mt-2">Create an account to save clips, build watchlists, and sync with friends.</p> */}
                </div>

                <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Your name"
                                className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-3
outline-none transition-colors placeholder-gray-500"
                            />
                        </div>
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
                                autoComplete="new-password"
                                placeholder="At least 6 characters"
                                className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-3
outline-none transition-colors placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
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
                                <><i className="fa-solid fa-circle-notch fa-spin" /> Creating account…</>
                            ) : 'Create Account'}
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
                    Already have an account?{' '}
                    <Link to="/login" className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}