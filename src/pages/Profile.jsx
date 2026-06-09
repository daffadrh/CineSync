import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyProfile, updateProfile, getFriends } from '../services/profile-service.js';
import { getRecommendations } from '../services/recommendations-service.js';
import { IMG_BASE_URL } from '../services/tmdb-api.js';

const LABEL = 'block text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1';
const INPUT = 'w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-yellow-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors';

export default function Profile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [friends, setFriends] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ displayName: '', username: '', bio: '' });
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState(null);

    useEffect(() => {
        async function load() {
            const token = await currentUser.getIdToken();
            const [profileData, friendsData, recsData] = await Promise.all([
                getMyProfile(token),
                getFriends(token, currentUser.uid),
                getRecommendations(token),
            ]);
            setProfile(profileData.user);
            setFriends(friendsData.friends);
            setRecommendations(recsData.recommendations);
            setLoading(false);
        }
        load();
    }, []);

    function startEditing() {
        setEditForm({
            displayName: profile.displayName ?? '',
            username: profile.username ?? '',
            bio: profile.bio ?? '',
        });
        setEditError(null);
        setEditing(true);
    }

    function cancelEditing() {
        setEditing(false);
        setEditError(null);
    }

    async function handleSave() {
        setSaving(true);
        setEditError(null);
        try {
            const token = await currentUser.getIdToken();
            const data = await updateProfile(token, editForm);
            setProfile(data.user);
            setEditing(false);
        } catch (err) {
            setEditError(
                err.message.includes('409') ? 'Username already taken.' : 'Failed to save. Try again.'
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
            </div>
        );
    }

    const joinedYear = profile.joinedAt ? new Date(profile.joinedAt).getFullYear() : null;
    const initial = (profile.displayName ?? currentUser.email ?? '?')[0].toUpperCase();
    const email = profile.email ?? currentUser.email ?? null;

    return (
        <div className="px-8 py-8">
        <div className="max-w-screen-xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-6">Your profile</p>

            {/* Profile card */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 mb-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border-2 border-[#333]">
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover rounded-full" />
                            : <span className="text-white text-2xl font-bold">{initial}</span>
                        }
                    </div>

                    {/* Info / edit form */}
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <div className="space-y-3">
                                <div>
                                    <label className={LABEL}>Display Name</label>
                                    <input
                                        type="text"
                                        value={editForm.displayName}
                                        onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                                        placeholder="Your display name"
                                        className={INPUT}
                                    />
                                </div>
                                <div>
                                    <label className={LABEL}>Username</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                                        placeholder="your_username"
                                        className={INPUT}
                                    />
                                </div>
                                <div>
                                    <label className={LABEL}>Email</label>
                                    <input
                                        type="text"
                                        value={email ?? ''}
                                        disabled
                                        className="w-full bg-[#111] border border-[#222] text-gray-600 rounded-lg px-3 py-2 text-sm outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className={LABEL}>Bio</label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                                        placeholder="Tell people a bit about yourself"
                                        rows={2}
                                        className={`${INPUT} resize-none`}
                                    />
                                </div>
                                {editError && (
                                    <p className="text-red-400 text-xs">{editError}</p>
                                )}
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-4 py-1.5 bg-yellow-500 text-black text-sm font-medium rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="px-4 py-1.5 bg-[#1a1a1a] text-gray-400 text-sm rounded-full hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className={LABEL}>Display Name</p>
                                        <p className="text-white font-semibold text-lg leading-tight">
                                            {profile.displayName ?? '—'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={startEditing}
                                        title="Edit profile"
                                        className="text-gray-500 hover:text-white transition-colors flex-shrink-0 ml-4 mt-1"
                                    >
                                        <i className="fa-solid fa-pen text-xs" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className={LABEL}>Username</p>
                                        <p className="text-gray-200 text-sm">
                                            {profile.username ? `@${profile.username}` : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={LABEL}>Email</p>
                                        <p className="text-gray-200 text-sm truncate">{email ?? '—'}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className={LABEL}>Bio</p>
                                    <p className="text-gray-200 text-sm leading-relaxed">
                                        {profile.bio ?? '—'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-[#2a2a2a]">
                                    {joinedYear && (
                                        <span>
                                            <i className="fa-regular fa-calendar mr-1.5" />
                                            Joined {joinedYear}
                                        </span>
                                    )}
                                    <span>
                                        <i className="fa-solid fa-user-group mr-1.5" />
                                        {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummaryCard
                    title="Friends"
                    onViewAll={() => navigate('/friends')}
                    empty={friends.length === 0}
                    emptyText="No friends yet. Find people on the Friends page."
                >
                    <div className="flex flex-wrap gap-3">
                        {friends.slice(0, 6).map(f => (
                            <FriendAvatar key={f.id} friend={f} />
                        ))}
                    </div>
                </SummaryCard>

                <SummaryCard
                    title="Recommendations"
                    onViewAll={() => navigate('/recommendations')}
                    empty={recommendations.length === 0}
                    emptyText="No recommendations yet."
                >
                    <div className="space-y-3">
                        {recommendations.slice(0, 3).map(rec => (
                            <RecPreviewRow key={rec.id} rec={rec} />
                        ))}
                    </div>
                </SummaryCard>
            </div>
        </div>
        </div>
    );
}

function SummaryCard({ title, onViewAll, empty, emptyText, children }) {
    return (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                <button
                    onClick={onViewAll}
                    className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors font-medium"
                >
                    View all →
                </button>
            </div>
            {empty
                ? <p className="text-gray-500 text-xs">{emptyText}</p>
                : children
            }
        </div>
    );
}

function FriendAvatar({ friend }) {
    const initial = (friend.displayName ?? friend.username ?? '?')[0].toUpperCase();
    return (
        <div className="flex flex-col items-center gap-1.5" title={friend.displayName ?? friend.username}>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-[#2a2a2a]">
                {friend.avatarUrl
                    ? <img src={friend.avatarUrl} alt={friend.username} className="w-full h-full object-cover" />
                    : <span className="text-white text-sm font-semibold">{initial}</span>
                }
            </div>
            <span className="text-gray-400 text-[10px] truncate max-w-[48px]">@{friend.username}</span>
        </div>
    );
}

function RecPreviewRow({ rec }) {
    const poster = rec.posterPath ? `${IMG_BASE_URL}${rec.posterPath}` : null;
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-12 rounded bg-[#1a1a1a] flex-shrink-0 overflow-hidden">
                {poster
                    ? <img src={poster} alt={rec.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-600 text-xs" />
                      </div>
                }
            </div>
            <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{rec.title}</p>
                <p className="text-gray-500 text-[10px]">from @{rec.from?.username ?? 'unknown'}</p>
            </div>
        </div>
    );
}
