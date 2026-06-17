'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { getResults, getResultById, getResultsSummary } = require('../controllers/results.controller');
const { exportResultsCsv, exportResultByIdCsv } = require('../controllers/results-export.controller');

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
 * /results/export-csv:
 *   post:
 *     summary: Bulk-export selected results as CSV
 *     tags: [Results (Web)]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [result_ids]
 *             properties:
 *               result_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 maxItems: 500
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request — result_ids missing or > 500
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: No matching results found
 */
router.post('/export-csv', authenticate, authorizeRoles('Admin', 'Supervisor'), exportResultsCsv);

/**
 * @swagger
 * /results/summary:
 *   get:
 *     summary: Get result status summary counts
 *     tags: [Results (Web)]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Summary counts by test type and result status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/summary', authenticate, authorizeRoles('Admin', 'Supervisor'), getResultsSummary);

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

/**
 * @swagger
 * /results/{result_id}/export-csv:
 *   get:
 *     summary: Export a single result record as CSV
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
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Result not found
 */
router.get('/:result_id/export-csv', authenticate, authorizeRoles('Admin', 'Supervisor'), exportResultByIdCsv);

module.exports = router;