'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { getFacilities } = require('../controllers/facilities.controller');

/**
 * @swagger
 * tags:
 *   name: Facilities (Web)
 *   description: Facility management endpoints
 */

/**
 * @swagger
 * /facilities:
 *   get:
 *     summary: Get all active facilities for the authenticated user's organization
 *     tags: [Facilities (Web)]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active facilities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facilities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       facility_id:
 *                         type: string
 *                         format: uuid
 *                       facility_name:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch facilities
 */
router.get('/', authenticate, authorizeRoles('Admin', 'Supervisor', 'Testing Staff'), getFacilities);

module.exports = router;