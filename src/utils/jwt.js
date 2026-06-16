const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const signAccessToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
    });
};

const signRefreshToken = (payload) => {
    return jwt.sign(payload, jwtConfig.refreshSecret, {
        expiresIn: jwtConfig.refreshExpiresIn,
    });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, jwtConfig.secret);
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, jwtConfig.refreshSecret);
};

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
