const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Access token is missing.', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        const user = await User.findOne({
            where: { user_id: decoded.user_id, status: 'Active' },
            attributes: { exclude: ['password_hash'] },
        });

        if (!user) {
            return errorResponse(res, 'User not found or account is inactive.', 401);
        }

        if (!user.web_access_enabled) {
            return errorResponse(res, 'Web access is not permitted for your account.', 403);
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return errorResponse(res, 'Access token has expired.', 401);
        }
        if (err.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Invalid access token.', 401);
        }
        return errorResponse(res, 'Authentication failed.', 401);
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return errorResponse(res, 'You do not have permission to perform this action.', 403);
        }
        next();
    };
};

module.exports = { authenticate, authorizeRoles };
