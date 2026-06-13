const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const resultRoutes = require('./result.routes');  // ADD

router.use('/auth', authRoutes);
router.use('/results', resultRoutes);             // ADD

// Future routes — uncomment as you build them
// const dashboardRoutes = require('./dashboard.routes');
module.exports = router;