const express = require('express');
const router  = express.Router();

const { mobileLogin, getMobileProfile }  = require('./auth.controller');
const { loginValidationRules, validate } = require('./auth.validator');
const { mobileAuthenticate }             = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Mobile Auth
 *   description: Authentication endpoints for Testing Staff
 */

/**
 * @swagger
 * /mobile/auth/login:
 *   post:
 *     tags: [Mobile Auth]
 *     summary: Mobile Login
 *     description: Authenticates a Testing Staff user and returns JWT tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: j.okafor@metrico.io
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: Jamal@1234
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Mobile login successful.
 *               data:
 *                 access_token: eyJhbGci...
 *                 refresh_token: eyJhbGci...
 *                 login_method: email_password
 *                 user:
 *                   user_id: a1b2c3d4-0000-0000-0000-000000000005
 *                   name: Jamal Okafor
 *                   email: j.okafor@metrico.io
 *                   role: Testing Staff
 *                   facility:
 *                     facility_id: f0000000-0000-0000-0000-00000000000a
 *                     facility_name: Plant A
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid email or password.
 *       403:
 *         description: Account deactivated or role is not Testing Staff
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Mobile app access is only available for Testing Staff.
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation failed.
 *               errors:
 *                 - field: email
 *                   message: Please provide a valid email address.
 */
router.post('/login', loginValidationRules, validate, mobileLogin);

/**
 * @swagger
 * /mobile/auth/profile:
 *   get:
 *     tags: [Mobile Auth]
 *     summary: Get User Profile
 *     description: Returns the authenticated user's profile. Requires Bearer token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Profile fetched successfully.
 *               data:
 *                 user:
 *                   user_id: a1b2c3d4-0000-0000-0000-000000000005
 *                   name: Jamal Okafor
 *                   email: j.okafor@metrico.io
 *                   role: Testing Staff
 *                   facility:
 *                     facility_id: f0000000-0000-0000-0000-00000000000a
 *                     facility_name: Plant A
 *       401:
 *         description: Missing or expired token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized. Token is missing or expired.
 *       403:
 *         description: Account deactivated
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Account is deactivated.
 */
router.get('/profile', mobileAuthenticate, getMobileProfile);

module.exports = router;