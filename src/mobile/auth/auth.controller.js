const { mobileLoginService, getMobileProfileService } = require('./auth.service');

const mobileLogin = async (req, res) => {
    try {
        const result = await mobileLoginService({
            email: req.body.email,
            password: req.body.password,
            ip: req.ip,
        });

        return res.status(result.status).json(
            result.success
                ? { success: true, message: result.message, data: result.data }
                : { success: false, message: result.message }
        );

    } catch (error) {
        console.error('[mobileLogin] Error:', error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

const getMobileProfile = async (req, res) => {
    try {
        const result = await getMobileProfileService({
            user_id: req.user.user_id,   // comes from auth middleware
        });

        return res.status(result.status).json(
            result.success
                ? { success: true, message: result.message, data: result.data }
                : { success: false, message: result.message }
        );

    } catch (error) {
        console.error('[getMobileProfile] Error:', error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

module.exports = { mobileLogin, getMobileProfile };