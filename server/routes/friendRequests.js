import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { sendFriendRequest, listFriendRequests, listOutgoingFriendRequests, acceptFriendRequest, rejectFriendRequest } from "../data/friendRequests.js";

export const friendRequestsRouter = Router();

friendRequestsRouter.use(requireAuth);

friendRequestsRouter.get('/outgoing', async (req, res) => {
    try {
        const sentUids = await listOutgoingFriendRequests(req.user.uid);
        res.json({ sentUids });
    } catch (error) {
        console.error('Error listing outgoing friend requests:', error);
        res.status(500).json({ error: 'Failed to list outgoing friend requests' });
    }
});

friendRequestsRouter.get('/', async (req, res) => {
    try {
        const requests = await listFriendRequests(req.user.uid);
        res.json({ requests });
    } catch (error) {
        console.error('Error listing friend requests:', error);
        res.status(500).json({ error: 'Failed to list friend requests' });
    }
});

friendRequestsRouter.post('/', async (req, res) => {
    try {
        const { toUid } = req.body;
        if (!toUid) {
            return res.status(400).json({ error: 'Missing toUid' });
        }

        const request = await sendFriendRequest(req.user.uid, toUid);
        res.status(201).json({ request });
    } catch (error) {
        if (error.message === 'Cannot send a friend request to yourself') {
            return res.status(400).json({ error: error.message });
        }
        if (['Friend request already pending', 'Already friends', 'Must wait before sending another request'].includes(error.message)) {
            return res.status(409).json({ error: error.message });
        }
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

friendRequestsRouter.post('/:requestId/accept', async (req, res) => {
    try {
        await acceptFriendRequest(req.params.requestId, req.user.uid);
        res.status(204).send();
    } catch (error) {
        if (error.message === 'Friend request not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Not authorized to accept this request') {
            return res.status(403).json({ error: error.message });
        }
        if (error.message === 'Friend request is no longer pending') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
});

friendRequestsRouter.post('/:requestId/reject', async (req, res) => {
    try {
        await rejectFriendRequest(req.params.requestId, req.user.uid);
        res.status(204).send();
    } catch (error) {
        if (error.message === 'Friend request not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Not authorized to reject this request') {
            return res.status(403).json({ error: error.message });
        }
        if (error.message === 'Friend request is no longer pending') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ error: 'Failed to reject friend request' });
    }
});
