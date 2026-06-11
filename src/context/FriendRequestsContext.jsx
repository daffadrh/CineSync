import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getFriendRequests } from '../services/profile-service.js';

const FriendRequestsContext = createContext(null);

export function FriendRequestsProvider({ children }) {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState([]);

    async function refresh() {
        if (!currentUser) {
            setRequests([]);
            return;
        }
        const token = await currentUser.getIdToken();
        const data = await getFriendRequests(token);
        setRequests(data.requests);
    }

    useEffect(() => {
        refresh();
    }, [currentUser]);

    return (
        <FriendRequestsContext.Provider value={{ requests, refresh }}>
            {children}
        </FriendRequestsContext.Provider>
    );
}

export function useFriendRequests() {
    return useContext(FriendRequestsContext);
}
