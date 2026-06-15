const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const resultsRouter = require('./results.routes');

router.use('/auth', authRoutes);
router.use('/results', resultsRouter);
// Future routes — uncomment as you build them
// const dashboardRoutes = require('./dashboard.routes');
module.exports = router;