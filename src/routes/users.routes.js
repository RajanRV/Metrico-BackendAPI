'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { getUsers, createUser, updateUser, setUserStatus } = require('../controllers/users.controller');

/**
 * @swagger
 * tags:
 *   name: Users (Web)
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get paginated list of users
 *     tags: [Users (Web)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by first name, last name, email, or facility name
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [Admin, Supervisor, Testing Staff] }
 *       - in: query
 *         name: facility_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Active, Inactive, Invited] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id: { type: string, format: uuid }
 *                       first_name: { type: string }
 *                       last_name: { type: string }
 *                       email: { type: string, format: email }
 *                       role: { type: string, enum: [Admin, Supervisor, Testing Staff] }
 *                       status: { type: string, enum: [Active, Inactive, Invited] }
 *                       Facility:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           facility_id: { type: string, format: uuid }
 *                           facility_name: { type: string }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch users
 */
router.get('/', authenticate, authorizeRoles('Admin', 'Supervisor'), getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user and send an invite email
 *     tags: [Users (Web)]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, role, facility_id]
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [Admin, Supervisor, Testing Staff] }
 *               facility_id: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: User created. If mail is not configured, temp_password is returned in the response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id: { type: string, format: uuid }
 *                     first_name: { type: string }
 *                     last_name: { type: string }
 *                     email: { type: string, format: email }
 *                     role: { type: string, enum: [Admin, Supervisor, Testing Staff] }
 *                     status: { type: string, example: Invited }
 *                     email_sent: { type: boolean }
 *                 temp_password:
 *                   type: string
 *                   description: Only present when mail service is not configured
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already in use
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to create user
 */
router.post('/', authenticate, authorizeRoles('Admin'), createUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update an existing user's details
 *     tags: [Users (Web)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, role, facility_id]
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [Admin, Supervisor, Testing Staff] }
 *               facility_id: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id: { type: string, format: uuid }
 *                     first_name: { type: string }
 *                     last_name: { type: string }
 *                     email: { type: string, format: email }
 *                     role: { type: string, enum: [Admin, Supervisor, Testing Staff] }
 *                     status: { type: string, enum: [Active, Inactive, Invited] }
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use by another user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to update user
 */
router.patch('/:id', authenticate, authorizeRoles('Admin'), updateUser);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Deactivate or reactivate a user
 *     description: >
 *       Updates user status and syncs web_access_enabled in lockstep.
 *       Deactivating always disables web access; reactivating restores it
 *       for all roles except Testing Staff. A user cannot change their own status.
 *     tags: [Users (Web)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [Active, Inactive] }
 *     responses:
 *       200:
 *         description: User status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id: { type: string, format: uuid }
 *                     first_name: { type: string }
 *                     last_name: { type: string }
 *                     email: { type: string, format: email }
 *                     role: { type: string, enum: [Admin, Supervisor, Testing Staff] }
 *                     status: { type: string, enum: [Active, Inactive] }
 *       400:
 *         description: Invalid status value or attempt to change own status
 *       404:
 *         description: User not found
 *       409:
 *         description: User already has that status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to update user status
 */
router.patch('/:id/status', authenticate, authorizeRoles('Admin'), setUserStatus);

module.exports = router;