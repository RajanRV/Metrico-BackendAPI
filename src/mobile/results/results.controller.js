'use strict';

const { syncMobileResultService, getMobileResultsService } = require('./results.service');

const syncMobileResult = async (req, res) => {
    try {
        const result = await syncMobileResultService({
            test_type: req.body.test_type,
            test_value: req.body.test_value,
            device_name: req.body.device_name,
            user: req.user,
        });

        return res.status(result.status).json(
            result.success
                ? { success: true, message: result.message, data: result.data }
                : { success: false, message: result.message, ...(result.available_devices && { available_devices: result.available_devices }) }
        );
    } catch (err) {
        console.error('[syncMobileResult]', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

const getMobileResults = async (req, res) => {
    try {
        const result = await getMobileResultsService({
            user: req.user,
            test_type: req.query.test_type,
            result_status: req.query.result_status,
            search: req.query.search,
            page: req.query.page,
            limit: req.query.limit,
        });

        return res.status(result.status).json(
            result.success
                ? { success: true, message: result.message, data: result.data }
                : { success: false, message: result.message }
        );
    } catch (err) {
        console.error('[getMobileResults]', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

module.exports = { syncMobileResult, getMobileResults };