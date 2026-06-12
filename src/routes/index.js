const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');

router.use('/auth', authRoutes);

// Future routes — uncomment as you build them
// const dashboardRoutes = require('./dashboard.routes');
module.exports = router;
