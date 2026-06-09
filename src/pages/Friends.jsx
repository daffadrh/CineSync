import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
    getFriends,
    getFriendRequests,
    getOutgoingFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
} from '../services/profile-service.js';

export default function Friends() {
    const { currentUser } = useAuth();

    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [sentRequests, setSentRequests] = useState(new Set());

    useEffect(() => {
        async function load() {
            const token = await currentUser.getIdToken();
            const [friendsData, requestsData, outgoingData] = await Promise.all([
                getFriends(token, currentUser.uid),
                getFriendRequests(token),
                getOutgoingFriendRequests(token),
            ]);
            setFriends(friendsData.friends);
            setRequests(requestsData.requests);
            setSentRequests(new Set(outgoingData.sentUids));
            setLoading(false);
        }
        load();
    }, []);

    async function handleSearch(e) {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        setSearching(true);
        const data = await searchUsers(await currentUser.getIdToken(), q);
        setSearchResults(data.users);
        setSearching(false);
    }

    async function handleSendRequest(toUid) {
        const token = await currentUser.getIdToken();
        await sendFriendRequest(token, toUid);
        setSentRequests(prev => new Set([...prev, toUid]));
    }

    async function handleAccept(request) {
        const token = await currentUser.getIdToken();
        await acceptFriendRequest(token, request.id);
        setRequests(prev => prev.filter(r => r.id !== request.id));
        setFriends(prev => [...prev, { id: request.from.uid, ...request.from }]);
    }

    async function handleReject(requestId) {
        const token = await currentUser.getIdToken();
        await rejectFriendRequest(token, requestId);
        setRequests(prev => prev.filter(r => r.id !== requestId));
    }

    async function handleRemove(friendId) {
        const token = await currentUser.getIdToken();
        await removeFriend(token, friendId);
        setFriends(prev => prev.filter(f => f.id !== friendId));
    }

    const friendIdSet = new Set(friends.map(f => f.id));

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header — centered, fixed height */}
            <div className="px-8 pt-8 pb-6 flex-shrink-0">
                <div className="max-w-screen-xl mx-auto">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Your network</p>
                    <h1 className="text-4xl font-serif font-bold text-white">
                        Find <span className="italic text-yellow-500">Friends</span>.
                    </h1>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="max-w-screen-xl mx-auto space-y-10">

                    {/* Add Friends */}
                    <section>
                        <h2 className="text-sm font-semibold text-white mb-3">Add Friends</h2>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by username..."
                                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-yellow-500/50 transition-colors placeholder-gray-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching}
                                className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                            >
                                {searching
                                    ? <i className="fa-solid fa-circle-notch fa-spin" />
                                    : 'Search'
                                }
                            </button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl divide-y divide-[#2a2a2a]">
                                {searchResults.map(user => (
                                    <SearchResultRow
                                        key={user.uid}
                                        user={user}
                                        isFriend={friendIdSet.has(user.uid)}
                                        hasSent={sentRequests.has(user.uid)}
                                        isSelf={user.uid === currentUser.uid}
                                        onAdd={() => handleSendRequest(user.uid)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Friend Requests — only rendered when there are pending ones */}
                    {requests.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-sm font-semibold text-white">Friend Requests</h2>
                                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                    {requests.length}
                                </span>
                            </div>
                            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl divide-y divide-[#2a2a2a]">
                                {requests.map(request => (
                                    <RequestRow
                                        key={request.id}
                                        request={request}
                                        onAccept={() => handleAccept(request)}
                                        onReject={() => handleReject(request.id)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Friends list */}
                    <section>
                        <h2 className="text-sm font-semibold text-white mb-3">
                            Your Friends
                            <span className="text-gray-500 font-normal ml-2">({friends.length})</span>
                        </h2>

                        {friends.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <i className="fa-solid fa-user-group text-gray-700 text-4xl mb-4" />
                                <p className="text-gray-400 text-sm">You haven't added any friends yet.</p>
                                <p className="text-gray-600 text-xs mt-1">Search for people above to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {friends.map(friend => (
                                    <FriendCard
                                        key={friend.id}
                                        friend={friend}
                                        onRemove={() => handleRemove(friend.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
}

function FriendCard({ friend, onRemove }) {
    const initial = (friend.displayName ?? friend.username ?? '?')[0].toUpperCase();
    return (
        <div className="flex items-center gap-3 bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-[#333] overflow-hidden">
                {friend.avatarUrl
                    ? <img src={friend.avatarUrl} alt={friend.username} className="w-full h-full object-cover" />
                    : <span className="text-white text-sm font-semibold">{initial}</span>
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                    {friend.displayName ?? friend.username}
                </p>
                {friend.username && (
                    <p className="text-gray-500 text-xs truncate">@{friend.username}</p>
                )}
            </div>
            <button
                onClick={onRemove}
                title="Remove friend"
                className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 ml-2"
            >
                <i className="fa-solid fa-user-minus text-sm" />
            </button>
        </div>
    );
}

function RequestRow({ request, onAccept, onReject }) {
    const { from, createdAt } = request;
    const initial = (from.displayName ?? from.username ?? '?')[0].toUpperCase();

    const timeAgo = (() => {
        const diff = Date.now() - new Date(createdAt).getTime();
        const days = Math.floor(diff / 86400000);
        if (days > 0) return `${days}d ago`;
        const hours = Math.floor(diff / 3600000);
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    })();

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-[#333] overflow-hidden">
                {from.avatarUrl
                    ? <img src={from.avatarUrl} alt={from.username} className="w-full h-full object-cover" />
                    : <span className="text-white text-sm font-semibold">{initial}</span>
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                    {from.displayName ?? from.username}
                </p>
                <p className="text-gray-500 text-xs">@{from.username} · {timeAgo}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button
                    onClick={onAccept}
                    className="px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded-full hover:bg-yellow-400 transition-colors"
                >
                    Accept
                </button>
                <button
                    onClick={onReject}
                    className="px-3 py-1 bg-[#2a2a2a] text-gray-400 text-xs rounded-full hover:text-white hover:bg-[#333] transition-colors"
                >
                    Reject
                </button>
            </div>
        </div>
    );
}

function SearchResultRow({ user, isFriend, hasSent, isSelf, onAdd }) {
    const initial = (user.displayName ?? user.username ?? '?')[0].toUpperCase();

    let action;
    if (isSelf) {
        action = <span className="text-xs text-gray-600">You</span>;
    } else if (isFriend) {
        action = <span className="text-xs text-gray-500 px-3 py-1 bg-[#1a1a1a] rounded-full">Friends</span>;
    } else if (hasSent) {
        action = (
            <button disabled className="px-3 py-1 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500 text-xs font-medium rounded-full cursor-default">
                Sent
            </button>
        );
    } else {
        action = (
            <button
                onClick={onAdd}
                className="px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded-full hover:bg-yellow-400 transition-colors"
            >
                Send Request
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-[#333] overflow-hidden">
                {user.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    : <span className="text-white text-sm font-semibold">{initial}</span>
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                    {user.displayName ?? user.username}
                </p>
                <p className="text-gray-500 text-xs truncate">@{user.username}</p>
            </div>
            <div className="flex-shrink-0">{action}</div>
        </div>
    );
}
