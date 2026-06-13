'use strict';

const { Op } = require('sequelize');
const { TestResult } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const SORTABLE_COLUMNS = {
    tested_at: 'tested_at',
    test_type: 'test_type',
    result_status: 'result_status',
    user_name_snapshot: 'user_name_snapshot',
    device_id: 'device_id',
};

/**
 * GET /api/v1/results
 */
exports.getResults = async (req, res) => {
    try {
        const {
            date_from,
            date_to,
            facility_id,
            user_id,
            device_id,
            test_type,
            result_status,
            sync_status,
            sort_by = 'tested_at',
            sort_order = 'DESC',
            page = 1,
            page_size = 25,
        } = req.query;

        const where = {};

        // --- Facility restriction ---
        const userFacilityId = req.user.facility_id;

        if (!userFacilityId) {
            return errorResponse(res, 'Your account is not assigned to a facility.', 403);
        }

        if (facility_id) {
            if (facility_id !== userFacilityId) {
                return errorResponse(res, 'Access denied to this facility.', 403);
            }
            where.facility_id = facility_id;
        } else {
            where.facility_id = userFacilityId;
        }

        // --- Date filter ---
        if (date_from || date_to) {
            where.tested_at = {};
            if (date_from) where.tested_at[Op.gte] = new Date(date_from);
            if (date_to) where.tested_at[Op.lte] = new Date(date_to);
        }

        // --- Other filters ---
        if (user_id) where.user_id = user_id;
        if (device_id) where.device_id = device_id;
        if (test_type) where.test_type = test_type;
        if (result_status) where.result_status = result_status;
        if (sync_status) where.sync_status = sync_status;

        // --- Sorting (column already whitelisted by validator) ---
        const column = SORTABLE_COLUMNS[sort_by] || 'tested_at';
        const direction = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // --- Pagination ---
        const limit = Math.min(Math.max(parseInt(page_size) || 25, 1), 100);
        const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limit;

        const { count, rows } = await TestResult.findAndCountAll({
            where,
            order: [[column, direction]],
            limit,
            offset,
            attributes: [
                'result_id',
                'tested_at',
                'test_type',
                'estimated_value',
                'unit',
                'detected_color_hex',
                'detected_color_hex_yellow',
                'detected_color_hex_blue',
                'detected_color_label',
                'accepted_min_value',
                'accepted_max_value',
                'result_status',
                'user_name_snapshot',
                'device_id',
                'device_name_snapshot',
                'sync_status',
                'retest_of_result_id',
            ],
        });

        return successResponse(res, {
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page) || 1,
                page_size: limit,
                total_pages: Math.ceil(count / limit),
            },
        }, 'Results fetched successfully.');

    } catch (err) {
        console.error('getResults error:', err);
        return errorResponse(res, 'Failed to fetch results.', 500);
    }
};

/**
 * GET /api/v1/results/:result_id
 */
exports.getResultById = async (req, res) => {
    try {
        const { result_id } = req.params;

        // Basic UUID format check
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(result_id)) {
            return errorResponse(res, 'Invalid result ID format.', 400);
        }

        const result = await TestResult.findOne({ where: { result_id } });

        if (!result) {
            return errorResponse(res, 'Result not found.', 404);
        }

        // Facility access check
        if (result.facility_id !== req.user.facility_id) {
            return errorResponse(res, 'Access denied.', 403);
        }

        return successResponse(res, { data: result }, 'Result fetched successfully.');

    } catch (err) {
        console.error('getResultById error:', err);
        return errorResponse(res, 'Failed to fetch result.', 500);
    }
};