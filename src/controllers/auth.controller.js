'use strict';
const crypto = require('crypto');
const { User } = require('../models');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { writeAuditLog } = require('../utils/auditLogger');
const AUDIT = require('../utils/auditActions');
const { successResponse, errorResponse } = require('../utils/response');

const resetTokenStore = new Map();

const getClientIp = (req) =>
    req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

const buildTokenPayload = (user) => ({
    user_id: user.user_id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
    facility_id: user.facility_id,
});

const buildUserResponse = (user) => ({
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
    facility_id: user.facility_id,
});

const login = async (req, res) => {
    const { email, password } = req.body;
    const ip = getClientIp(req);

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
        await writeAuditLog({
            action_type: AUDIT.USER_LOGIN_FAILED,
            details_json: { email, reason: 'User not found' },
            ip_address: ip,
        });
        return errorResponse(res, 'Invalid email or password.', 401);
    }

    if (user.status === 'Inactive') {
        await writeAuditLog({
            action_type: AUDIT.USER_LOGIN_FAILED,
            user,
            details_json: { reason: 'Account inactive' },
            ip_address: ip,
        });
        return errorResponse(res, 'Your account has been deactivated. Please contact your administrator.', 403);
    }

    if (!user.web_access_enabled) {
        await writeAuditLog({
            action_type: AUDIT.USER_LOGIN_FAILED,
            user,
            details_json: { reason: 'Web access not permitted', role: user.role },
            ip_address: ip,
        });
        return errorResponse(res, 'Web access is not permitted for your account.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        await writeAuditLog({
            action_type: AUDIT.USER_LOGIN_FAILED,
            user,
            details_json: { reason: 'Incorrect password' },
            ip_address: ip,
        });
        return errorResponse(res, 'Invalid email or password.', 401);
    }

    const updates = { last_login_at: new Date() };
    if (user.status === 'Invited') {
        updates.status = 'Active';
    }
    await user.update(updates);

    const payload = buildTokenPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await writeAuditLog({
        action_type: AUDIT.USER_LOGIN,
        user,
        record_type: 'User',
        record_id: user.user_id,
        details_json: { role: user.role },
        ip_address: ip,
    });

    return successResponse(res, {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: buildUserResponse(user),
    }, 'Login successful.');
};

const logout = async (req, res) => {

    await writeAuditLog({
        action_type: AUDIT.USER_LOGOUT,
        user: req.user,
        record_type: 'User',
        record_id: req.user.user_id,
        ip_address: getClientIp(req),
    });

    return successResponse(res, {}, 'Logged out successfully.');
};

const refreshToken = async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return errorResponse(res, 'Refresh token is required.', 400);
    }

    try {
        const decoded = verifyRefreshToken(refresh_token);
        const user = await User.findOne({
            where: { user_id: decoded.user_id, status: 'Active' },
        });

        if (!user || !user.web_access_enabled) {
            return errorResponse(res, 'Invalid refresh token.', 401);
        }

        const payload = buildTokenPayload(user);
        const accessToken = signAccessToken(payload);

        return successResponse(res, { access_token: accessToken }, 'Token refreshed.');
    } catch {
        return errorResponse(res, 'Invalid or expired refresh token.', 401);
    }
};

const me = async (req, res) => {
    return successResponse(res, {
        user: {
            ...buildUserResponse(req.user),
            last_login_at: req.user.last_login_at,
        },
    }, 'User profile fetched.');
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user || user.status !== 'Active') {
        return successResponse(res, {}, 'If this email is registered, a reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    resetTokenStore.set(resetToken, { user_id: user.user_id, expiresAt });

    await writeAuditLog({
        action_type: AUDIT.PASSWORD_RESET_REQ,
        user,
        record_type: 'User',
        record_id: user.user_id,
        ip_address: getClientIp(req),
    });

    return successResponse(res, {}, 'If this email is registered, a reset link has been sent.');
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    const entry = resetTokenStore.get(token);

    if (!entry || Date.now() > entry.expiresAt) {
        return errorResponse(res, 'Reset token is invalid or has expired.', 400);
    }

    const user = await User.findOne({ where: { user_id: entry.user_id } });
    if (!user) {
        return errorResponse(res, 'User not found.', 404);
    }

    const passwordHash = await User.hashPassword(password);
    await user.update({ password_hash: passwordHash });

    resetTokenStore.delete(token);

    await writeAuditLog({
        action_type: AUDIT.PASSWORD_RESET_DONE,
        user,
        record_type: 'User',
        record_id: user.user_id,
        ip_address: getClientIp(req),
    });

    return successResponse(res, {}, 'Password has been reset successfully. Please log in.');
};

module.exports = { login, logout, refreshToken, me, forgotPassword, resetPassword };
