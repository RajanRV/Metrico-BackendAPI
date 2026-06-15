'use strict';

const { Op } = require('sequelize');
const { TestResult, User, Device, Facility } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const RESULT_INCLUDES = [
    {
        model: User,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'role'],
        required: false,
    },
    {
        model: Device,
        as: 'device',
        attributes: [
            'device_id',
            'device_name',
            'serial_number',
            'location_label',
            'connection_status',
            'power_status',
            'firmware_version',
            'last_sync_at',
            'status',
        ],
        required: false,
    },
    {
        model: TestResult,
        as: 'originalResult',
        attributes: [
            'result_id',
            'test_type',
            'estimated_value',
            'unit',
            'result_status',
            'tested_at',
        ],
        required: false,
    },
    {
        model: Facility,
        as: 'facility',
        attributes: ['facility_id', 'facility_name'],
        required: false,
    },
];

const SORTABLE_COLUMNS = [
    'tested_at',
    'test_type',
    'result_status',
    'estimated_value',
    'user_name_snapshot',
    'device_name_snapshot',
    'sync_status',
];

const getResults = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            facility_id,
            user_id,
            device_id,
            test_type,
            result_status,
            sync_status,
            date_from,
            date_to,
            search,
            sort_by = 'tested_at',
            sort_order = 'DESC',
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = [25, 50, 100].includes(parseInt(limit)) ? parseInt(limit) : 25;
        const offset = (pageNum - 1) * limitNum;

        const orderCol = SORTABLE_COLUMNS.includes(sort_by) ? sort_by : 'tested_at';
        const orderDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const where = {
            organization_id: req.user.organization_id,
        };

        if (facility_id) {
            where.facility_id = facility_id;
        } else if (req.user.facility_id) {
            where.facility_id = req.user.facility_id;
        }

        if (user_id) where.user_id = user_id;
        if (device_id) where.device_id = device_id;
        if (test_type) where.test_type = test_type;
        if (result_status) where.result_status = result_status;
        if (sync_status) where.sync_status = sync_status;

        if (date_from || date_to) {
            where.tested_at = {};
            if (date_from) where.tested_at[Op.gte] = new Date(date_from);
            if (date_to) where.tested_at[Op.lte] = new Date(date_to);
        }

        if (search) {
            const decoded = decodeURIComponent(search.replace(/\+/g, ' ')).trim()
            const q = `%${decoded}%`
            where[Op.or] = [
                TestResult.sequelize.where(
                    TestResult.sequelize.cast(
                        TestResult.sequelize.col('TestResult.result_id'), 'text'
                    ),
                    { [Op.iLike]: q }
                ),
                { user_name_snapshot: { [Op.iLike]: q } },
                { device_name_snapshot: { [Op.iLike]: q } },
                { notes_from_mobile: { [Op.iLike]: q } },
            ];
        }

        const { count, rows } = await TestResult.findAndCountAll({
            where,
            order: [[orderCol, orderDir]],
            limit: limitNum,
            offset,
            include: RESULT_INCLUDES,
        });

        const totalPages = Math.ceil(count / limitNum);

        return successResponse(res, {
            results: rows,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                total_pages: totalPages,
                has_next: pageNum < totalPages,
                has_prev: pageNum > 1,
            },
        }, 'Results fetched.');
    } catch (err) {
        console.error('[getResults]', err);
        return errorResponse(res, 'Failed to fetch results.', 500);
    }
};

const getResultById = async (req, res) => {
    try {
        const where = {
            result_id: req.params.result_id,
            organization_id: req.user.organization_id,
            ...(req.user.facility_id && { facility_id: req.user.facility_id }),
        };

        const result = await TestResult.findOne({
            where,
            include: [
                ...RESULT_INCLUDES,
                {
                    model: TestResult,
                    as: 'retests',
                    attributes: [
                        'result_id',
                        'test_type',
                        'estimated_value',
                        'unit',
                        'result_status',
                        'tested_at',
                        'user_name_snapshot',
                    ],
                    required: false,
                },
            ],
        });

        if (!result) return errorResponse(res, 'Result not found.', 404);

        return successResponse(res, { result }, 'Result fetched.');
    } catch (err) {
        console.error('[getResultById]', err);
        return errorResponse(res, 'Failed to fetch result.', 500);
    }
};

const getResultsSummary = async (req, res) => {
    try {
        const { facility_id, date_from, date_to } = req.query;

        const where = {
            organization_id: req.user.organization_id,
        };

        if (facility_id) {
            where.facility_id = facility_id;
        } else if (req.user.facility_id) {
            where.facility_id = req.user.facility_id;
        }

        if (date_from || date_to) {
            where.tested_at = {};
            if (date_from) where.tested_at[Op.gte] = new Date(date_from);
            if (date_to) where.tested_at[Op.lte] = new Date(date_to);
        }

        const rows = await TestResult.findAll({
            where,
            attributes: [
                'result_status',
                'test_type',
                [
                    TestResult.sequelize.fn('COUNT', TestResult.sequelize.col('result_id')),
                    'count',
                ],
            ],
            group: ['result_status', 'test_type'],
            raw: true,
        });

        const summary = { HOCl: {}, pH: {} };
        for (const row of rows) {
            summary[row.test_type][row.result_status] = parseInt(row.count, 10);
        }

        return successResponse(res, { summary }, 'Summary fetched.');
    } catch (err) {
        console.error('[getResultsSummary]', err);
        return errorResponse(res, 'Failed to fetch summary.', 500);
    }
};

module.exports = { getResults, getResultById, getResultsSummary };