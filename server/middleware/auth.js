import { adminAuth } from '../firebase-admin.js';

export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' });
    }

    try {
        const decoded = await adminAuth.verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid authorization token' });
    }
}

export async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return next();
    }

    try {
        const decoded = await adminAuth.verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    } catch (error) {
        // invalid/expired token — fall through as anonymous rather than failing
    }

    next();
}