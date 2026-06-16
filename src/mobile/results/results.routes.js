'use strict';

const express = require('express');
const router = express.Router();

const { mobileAuthenticate }                  = require('../../middlewares/auth.middleware');
const { syncResultValidationRules, validate } = require('./results.validator');
const { syncMobileResult }                    = require('./results.controller');

/**
 * @swagger
 * tags:
 *   name: Mobile Results
 *   description: Test result sync endpoints for Testing Staff
 */

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
router.post('/sync', mobileAuthenticate, syncResultValidationRules, validate, syncMobileResult);

module.exports = router;