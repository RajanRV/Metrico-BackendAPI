const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
    loginRules,
    forgotPasswordRules,
    resetPasswordRules,
    validate,
} = require('../validators/auth.validator');

router.post('/login', loginRules, validate, controller.login);
router.post('/forgot-password', forgotPasswordRules, validate, controller.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, controller.resetPassword);
router.post('/refresh', controller.refreshToken);

router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;
