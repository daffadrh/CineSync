import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getOrCreateUser, updateUser, getUserById, getUserPublic, getFriends, removeFriend, searchUsersByUsername } from "../data/users.js";
import { friendRequestsRouter } from "./friendRequests.js";

export const usersRouter = Router();

usersRouter.use('/me/friend-requests', friendRequestsRouter);

usersRouter.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user.uid, { email: req.user.email, name: req.user.name });
        res.json({ user });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
});

usersRouter.patch('/me', requireAuth, async (req, res) => {
    try {
        const { displayName, username, avatarUrl, bio } = req.body;
        const user = await updateUser(req.user.uid, { displayName, username, avatarUrl, bio });
        res.json({ user });
    } catch (error) {
        if (error.message === 'Username already taken') {
            return res.status(409).json({ error: error.message });
        }
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error updating current user:', error);
        res.status(500).json({ error: 'Failed to update current user' });
    }
});

usersRouter.delete('/me/friends/:friendId', requireAuth, async (req, res) => {
    try {
        await removeFriend(req.user.uid, req.params.friendId);
        res.status(204).send();
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ error: 'Failed to remove friend' });
    }
});

usersRouter.get('/search', requireAuth, async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.status(400).json({ error: 'Missing search query' });

        const query = q.toLowerCase();
        const users = await searchUsersByUsername(query);
        res.json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

usersRouter.get('/:id', async (req, res) => {
    try {
        const user = await getUserPublic(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

usersRouter.get('/:id/friends', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const friends = await getFriends(req.params.id);
        res.json({ friends });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});
