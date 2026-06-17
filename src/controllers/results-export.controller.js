'use strict';

const { Op } = require('sequelize');
const { TestResult, User, Device, Facility } = require('../models');
const { errorResponse } = require('../utils/response');

function csvCell(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function toCsv(headers, keys, rows) {
    const lines = [headers.map(csvCell).join(',')];
    for (const row of rows) {
        lines.push(keys.map(k => csvCell(row[k])).join(','));
    }
    return lines.join('\r\n');
}

function mapResultToExportRow(r) {
    const userName   = r.user
        ? `${r.user.first_name} ${r.user.last_name}`
        : (r.user_name_snapshot ?? '');
    const userRole   = r.user?.role ?? r.user_role_snapshot ?? '';
    const deviceName = r.device?.device_name ?? r.device_name_snapshot ?? '';
    const facilityName = r.facility?.facility_name ?? '';

    return {
        result_id:            r.result_id,
        tested_at:            r.tested_at   ? new Date(r.tested_at).toISOString()  : '',
        synced_at:            r.synced_at   ? new Date(r.synced_at).toISOString()  : '',
        organization_id:      r.organization_id,
        facility:             facilityName,
        test_type:            r.test_type,
        estimated_value:      r.estimated_value ?? '',
        unit:                 r.unit,
        detected_color_label: r.detected_color_label ?? '',
        detected_color_hex:   r.detected_color_hex   ?? '',
        detected_color_hex_2: r.detected_color_hex_2 ?? '',
        accepted_min_value:   r.accepted_min_value ?? '',
        accepted_max_value:   r.accepted_max_value ?? '',
        result_status:        r.result_status,
        user_name:            userName,
        user_role:            userRole,
        device_id:            r.device_id ?? '',
        device_name:          deviceName,
        cartridge_type:       r.cartridge_type,
        mobile_notes:         r.notes_from_mobile ?? '',
        retest_of_result_id:  r.retest_of_result_id ?? '',
        sync_status:          r.sync_status,
    };
}

const CSV_HEADERS = [
    'Result ID', 'Tested At', 'Synced At', 'Organization ID', 'Facility',
    'Test Type', 'Estimated Value', 'Unit',
    'Detected Color Label', 'Detected Color Hex', 'Detected Color Hex 2 (HOCl Blue)',
    'Accepted Min Value', 'Accepted Max Value', 'Result Status',
    'User Name', 'User Role', 'Device ID', 'Device Name', 'Cartridge Type',
    'Mobile Notes', 'Retest Of Result ID', 'Sync Status',
];

const CSV_KEYS = [
    'result_id', 'tested_at', 'synced_at', 'organization_id', 'facility',
    'test_type', 'estimated_value', 'unit',
    'detected_color_label', 'detected_color_hex', 'detected_color_hex_2',
    'accepted_min_value', 'accepted_max_value', 'result_status',
    'user_name', 'user_role', 'device_id', 'device_name', 'cartridge_type',
    'mobile_notes', 'retest_of_result_id', 'sync_status',
];

const RESULT_INCLUDES = [
    {
        model: User,
        as: 'user',
        attributes: ['user_id', 'first_name', 'last_name', 'role'],
        required: false,
    },
    {
        model: Device,
        as: 'device',
        attributes: ['device_id', 'device_name', 'serial_number'],
        required: false,
    },
    {
        model: Facility,
        as: 'facility',
        attributes: ['facility_id', 'facility_name'],
        required: false,
    },
];

const exportResultsCsv = async (req, res) => {
    try {
        const { result_ids } = req.body;

        if (!Array.isArray(result_ids) || result_ids.length === 0) {
            return errorResponse(res, 'result_ids must be a non-empty array.', 400);
        }
        if (result_ids.length > 500) {
            return errorResponse(res, 'Cannot export more than 500 results at once.', 400);
        }

        const where = {
            result_id:       { [Op.in]: result_ids },
            organization_id: req.user.organization_id,
        };
        if (req.user.facility_id) {
            where.facility_id = req.user.facility_id;
        }

        const results = await TestResult.findAll({
            where,
            include: RESULT_INCLUDES,
            order: [['tested_at', 'DESC']],
        });

        if (results.length === 0) {
            return errorResponse(res, 'No matching results found.', 404);
        }

        const rows     = results.map(mapResultToExportRow);
        const csv      = toCsv(CSV_HEADERS, CSV_KEYS, rows);
        const filename = `metrico-results-${new Date().toISOString().slice(0, 10)}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csv);
    } catch (err) {
        console.error('[exportResultsCsv]', err);
        return errorResponse(res, 'Failed to export results.', 500);
    }
};

const exportResultByIdCsv = async (req, res) => {
    try {
        const where = {
            result_id:       req.params.result_id,
            organization_id: req.user.organization_id,
        };
        if (req.user.facility_id) {
            where.facility_id = req.user.facility_id;
        }

        const result = await TestResult.findOne({ where, include: RESULT_INCLUDES });

        if (!result) {
            return errorResponse(res, 'Result not found.', 404);
        }

        const rows     = [mapResultToExportRow(result)];
        const csv      = toCsv(CSV_HEADERS, CSV_KEYS, rows);
        const filename = `metrico-result-${result.result_id}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csv);
    } catch (err) {
        console.error('[exportResultByIdCsv]', err);
        return errorResponse(res, 'Failed to export result.', 500);
    }
};

module.exports = { exportResultsCsv, exportResultByIdCsv };