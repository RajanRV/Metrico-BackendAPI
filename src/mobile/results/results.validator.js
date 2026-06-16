'use strict';

const { body, query, validationResult } = require('express-validator');

const syncResultValidationRules = [
    body('test_type')
        .trim()
        .notEmpty().withMessage('test_type is required.')
        .isIn(['HOCl', 'pH']).withMessage('test_type must be HOCl or pH.'),

    body('test_value')
        .notEmpty().withMessage('test_value is required.')
        .isFloat({ min: 0 }).withMessage('test_value must be a non-negative number.'),

    body('device_name')
        .trim()
        .notEmpty().withMessage('device_name is required.')
        .isLength({ max: 255 }).withMessage('device_name must be 255 characters or fewer.'),
];

const getResultsValidationRules = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('page must be a positive integer.'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),

    query('test_type')
        .optional()
        .isIn(['HOCl', 'pH']).withMessage('test_type must be HOCl or pH.'),

    query('result_status')
        .optional()
        .isIn(['Within Range', 'Below Range', 'Above Range', 'Invalid Reading'])
        .withMessage('Invalid result_status value.'),

    query('search')
        .optional()
        .isString().trim(),
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

module.exports = { syncResultValidationRules, getResultsValidationRules, validate };