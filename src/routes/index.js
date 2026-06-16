const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const resultsRouter = require('./results.routes');
const mobileAuthRoutes = require('../mobile/auth/auth.routes');
const mobileResultRoutes  = require('../mobile/results/results.routes');

router.use('/auth', authRoutes);
router.use('/results', resultsRouter);
// Future routes — uncomment as you build them
// const dashboardRoutes = require('./dashboard.routes');

router.use('/mobile/auth', mobileAuthRoutes);
router.use('/mobile/results', mobileResultRoutes);
module.exports = router;