const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    console.error('[Error]', err);

    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
        return errorResponse(res, 'Validation error.', 422, errors);
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return errorResponse(res, 'A record with this value already exists.', 409);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token.', 401);
    }

    return errorResponse(res, err.message || 'Internal server error.', err.status || 500);
};

module.exports = errorHandler;
