const { query, validationResult } = require('express-validator');

const getResultsRules = [
    query('date_from')
        .optional()
        .isISO8601().withMessage('date_from must be a valid ISO date.'),

    query('date_to')
        .optional()
        .isISO8601().withMessage('date_to must be a valid ISO date.'),

    query('facility_id')
        .optional()
        .isUUID().withMessage('facility_id must be a valid UUID.'),

    query('user_id')
        .optional()
        .isUUID().withMessage('user_id must be a valid UUID.'),

    query('device_id')
        .optional()
        .isUUID().withMessage('device_id must be a valid UUID.'),

    query('test_type')
        .optional()
        .isIn(['HOCl', 'pH']).withMessage('test_type must be HOCl or pH.'),

    query('result_status')
        .optional()
        .isIn(['Within Range', 'Below Range', 'Above Range', 'Invalid Reading'])
        .withMessage('Invalid result_status value.'),

    query('sync_status')
        .optional()
        .isIn(['Synced', 'Pending Sync', 'Sync Failed'])
        .withMessage('Invalid sync_status value.'),

    query('sort_by')
        .optional()
        .isIn(['tested_at', 'test_type', 'result_status', 'user_name_snapshot', 'device_id'])
        .withMessage('Invalid sort_by value.'),

    query('sort_order')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('sort_order must be ASC or DESC.'),

    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('page must be a positive integer.'),

    query('page_size')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('page_size must be between 1 and 100.'),
];

const getResultByIdRules = [
    // result_id comes from params, validated separately if needed
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed.',
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

module.exports = { getResultsRules, validate };