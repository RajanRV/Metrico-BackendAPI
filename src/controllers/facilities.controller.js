'use strict';

const { Facility } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const getFacilities = async (req, res) => {
    try {
        const facilities = await Facility.findAll({
            where: { organization_id: req.user.organization_id, status: 'Active' },
            attributes: ['facility_id', 'facility_name'],
            order: [['facility_name', 'ASC']],
        });

        return successResponse(res, { facilities });
    } catch (err) {
        console.error('[getFacilities]', err.message);
        return errorResponse(res, 'Failed to fetch facilities.', 500);
    }
};

module.exports = { getFacilities };