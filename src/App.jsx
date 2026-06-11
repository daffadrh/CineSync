import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { FriendRequestsProvider } from './context/FriendRequestsContext.jsx';

import Layout from './components/Layout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import Home from './pages/Home.jsx';
import Discover from './pages/Discover.jsx';
import Clips from './pages/Clips.jsx';
import ClipViewer from './pages/ClipViewer.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Profile from './pages/Profile.jsx';
import Friends from './pages/Friends.jsx';
import Recommendations from './pages/Recommendations.jsx';

function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function GuestRoute({ children }) {
    const { currentUser } = useAuth();
    if (currentUser) return <Navigate to="/discover" replace />;
    return children;
}

function App() {
    return (
        <AuthProvider>
            <WatchlistProvider>
            <FriendRequestsProvider>
            <BrowserRouter>
                <Routes>
                    {/* Guest only routes */}
                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                    <Route element={<Layout />}>
                        {/* Content pages */}
                        <Route path="/" element={<Home />} />
                        <Route path="/discover" element={<Discover />} />
                        <Route path="/clips" element={<Clips />} />
                        <Route path="/clips/:id" element={<ClipViewer />} />

                        <Route path="/watchlist" element={
                            <ProtectedRoute>
                                <Watchlist />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/friends" element={
                            <ProtectedRoute>
                                <Friends />
                            </ProtectedRoute>
                        } />
                        <Route path="/recommendations" element={
                            <ProtectedRoute>
                                <Recommendations />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
            </FriendRequestsProvider>
            </WatchlistProvider>
        </AuthProvider>
    );
}

export default App;