'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { getResults, getResultById } = require('../controllers/results.controller');
const { exportResultById, exportResults } = require('../controllers/results.export.controller');

router.get('/', authenticate, authorizeRoles('Admin', 'Supervisor'), getResults);
router.get('/:result_id', authenticate, authorizeRoles('Admin', 'Supervisor'), getResultById);
router.get('/:result_id/export', authenticate, exportResultById);
router.post('/export', authenticate, exportResults);
module.exports = router;