'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { getResults, getResultById } = require('../controllers/results.controller');

/**
 * @swagger
 * tags:
 *   name: Results (Web)
 *   description: Test result endpoints for Admin and Supervisor users
 */

/**
 * @swagger
 * /results:
 *   get:
 *     summary: Get a list of test results
 *     tags: [Results (Web)]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of test results
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — requires Admin or Supervisor role
 */
router.get('/', authenticate, authorizeRoles('Admin', 'Supervisor'), getResults);

/**
 * @swagger
 * /results/{result_id}:
 *   get:
 *     summary: Get a single test result by ID
 *     tags: [Results (Web)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: result_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Test result details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — requires Admin or Supervisor role
 *       404:
 *         description: Result not found
 */
router.get('/:result_id', authenticate, authorizeRoles('Admin', 'Supervisor'), getResultById);
module.exports = router;