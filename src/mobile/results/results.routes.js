'use strict';

const express = require('express');
const router = express.Router();

// const { mobileAuthenticate } = require('../../middlewares/auth.middleware');
// const { syncResultValidationRules, getResultsValidationRules, validate } = require('./results.validator');
// const { syncMobileResult, getMobileResults } = require('./results.controller');

/**
 * @swagger
 * tags:
 *   name: Mobile Results
 *   description: Test result sync and history endpoints for Testing Staff
 */

/**
 * @swagger
 * /mobile/results:
 *   get:
 *     tags: [Mobile Results]
 *     summary: Get result history
 *     description: Returns the authenticated user's test results grouped by date (Today / Yesterday / Mon, Jun 8).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: test_type
 *         schema:
 *           type: string
 *           enum: [HOCl, pH]
 *         description: Filter by test type
 *       - in: query
 *         name: result_status
 *         schema:
 *           type: string
 *           enum: [Within Range, Below Range, Above Range, Invalid Reading]
 *         description: Filter by result status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by device name or notes
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Results fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Results fetched.
 *               data:
 *                 grouped:
 *                   - date_label: Today
 *                     results:
 *                       - result_id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                         test_type: HOCl
 *                         estimated_value: "1.8200"
 *                         unit: ppm
 *                         detected_color_hex: "#e8b94a"
 *                         detected_color_hex_2: "#4a8fcb"
 *                         detected_color_label: null
 *                         result_status: Within Range
 *                         sync_status: Synced
 *                         device_name: Line 2 Tester
 *                         device_serial: SN-MTR-D-014
 *                         notes: null
 *                         is_retest: false
 *                         tested_at: "2026-06-16T08:40:27.117Z"
 *                         synced_at: "2026-06-16T08:40:27.117Z"
 *                   - date_label: Yesterday
 *                     results:
 *                       - result_id: 9ab12cd3-0000-0000-0000-000000000001
 *                         test_type: HOCl
 *                         estimated_value: "0.4200"
 *                         unit: ppm
 *                         detected_color_hex: "#fde9b8"
 *                         detected_color_hex_2: "#bcd9ec"
 *                         detected_color_label: null
 *                         result_status: Below Range
 *                         sync_status: Synced
 *                         device_name: Line 1 Tester
 *                         device_serial: SN-MTR-D-012
 *                         notes: Re-test required
 *                         is_retest: false
 *                         tested_at: "2026-06-15T08:52:00.000Z"
 *                         synced_at: "2026-06-15T08:52:00.000Z"
 *                 pagination:
 *                   total: 24
 *                   page: 1
 *                   limit: 20
 *                   total_pages: 2
 *                   has_next: true
 *                   has_prev: false
 *       401:
 *         description: Missing or expired token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized. Token is missing or expired.
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation failed.
 *               errors:
 *                 - field: test_type
 *                   message: test_type must be HOCl or pH.
 */
// router.get('/', mobileAuthenticate, getResultsValidationRules, validate, getMobileResults);

/**
 * @swagger
 * /mobile/results/sync:
 *   post:
 *     tags: [Mobile Results]
 *     summary: Sync a test result
 *     description: Submits a single HOCl or pH test result from the mobile app. Color hex and result status are derived server-side.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [test_type, test_value, device_name]
 *             properties:
 *               test_type:
 *                 type: string
 *                 enum: [HOCl, pH]
 *                 example: HOCl
 *               test_value:
 *                 type: number
 *                 example: 1.82
 *               device_name:
 *                 type: string
 *                 example: Line 2 Tester
 *     responses:
 *       201:
 *         description: Result synced successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Test result synced successfully.
 *               data:
 *                 result_id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 test_type: HOCl
 *                 cartridge_type: HOCl
 *                 estimated_value: "1.8200"
 *                 unit: ppm
 *                 detected_color_hex: "#e8b94a"
 *                 detected_color_hex_2: "#4a8fcb"
 *                 detected_color_label: null
 *                 accepted_min_value: "0.5000"
 *                 accepted_max_value: "2.5000"
 *                 result_status: Within Range
 *                 user_id: a1b2c3d4-0000-0000-0000-000000000005
 *                 user_name_snapshot: Jamal Okafor
 *                 user_role_snapshot: Testing Staff
 *                 device_id: d0000000-0000-0000-0000-000000000014
 *                 device_name_snapshot: Line 2 Tester
 *                 device_serial_snapshot: SN-MTR-D-014
 *                 facility_id: f0000000-0000-0000-0000-00000000000a
 *                 organization_id: a0000000-0000-0000-0000-000000000001
 *                 sync_status: Synced
 *                 notes_from_mobile: null
 *                 retest_of_result_id: null
 *                 tested_at: "2026-06-16T08:40:27.117Z"
 *                 synced_at: "2026-06-16T08:40:27.117Z"
 *       401:
 *         description: Missing or expired token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized. Token is missing or expired.
 *       404:
 *         description: Device not found in caller's facility
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Device "Wrong Tester" not found in your facility.
 *               available_devices:
 *                 - device_name: Line 1 Tester
 *                   serial_number: SN-MTR-D-012
 *                 - device_name: Line 2 Tester
 *                   serial_number: SN-MTR-D-014
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation failed.
 *               errors:
 *                 - field: test_type
 *                   message: test_type must be HOCl or pH.
 *                 - field: test_value
 *                   message: test_value must be a non-negative number.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: An internal server error occurred.
 */
// router.post('/sync', mobileAuthenticate, syncResultValidationRules, validate, syncMobileResult);

module.exports = router;