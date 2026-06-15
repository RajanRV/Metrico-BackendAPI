'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { getResults, getResultById } = require('../controllers/results.controller');

router.get('/', authenticate, authorizeRoles('Admin', 'Supervisor'), getResults);
router.get('/:result_id', authenticate, authorizeRoles('Admin', 'Supervisor'), getResultById);

module.exports = router;