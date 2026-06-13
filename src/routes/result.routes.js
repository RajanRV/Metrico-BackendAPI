'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { getResults, getResultById } = require('../controllers/result.controller');
const { getResultsRules, validate } = require('../validators/result.validator');

router.get(
    '/',
    authenticate,
    authorizeRoles('Admin', 'Supervisor'),
    getResultsRules,
    validate,
    getResults
);

router.get(
    '/:result_id',
    authenticate,
    authorizeRoles('Admin', 'Supervisor'),
    getResultById
);

module.exports = router;