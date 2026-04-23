import jwt from 'jsonwebtoken';

// In-memory blacklist for simplicity (in production, use Redis or DB)
const tokenBlacklist = new Set();

export function addToBlacklist(token) {
    tokenBlacklist.add(token);
}

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Check blacklist
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        res.status(401).json({
            message: 'Unauthorized'
        });
    }
}

export default authMiddleware;