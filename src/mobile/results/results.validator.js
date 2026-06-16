'use strict';

const { body, validationResult } = require('express-validator');

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

module.exports = { syncResultValidationRules, validate };