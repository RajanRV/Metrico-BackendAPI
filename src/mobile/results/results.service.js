'use strict';

const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { TestResult, Device, User } = require('../../models');
const { getColorHex, getColorLabel } = require('../../utils/colorMap');

function deriveStatus(testType, value, minVal, maxVal) {
    if (value === null || value === undefined) return 'Invalid Reading';
    const v = parseFloat(value);
    const min = parseFloat(minVal);
    const max = parseFloat(maxVal);
    if (isNaN(v)) return 'Invalid Reading';
    if (v < min) return 'Below Range';
    if (v > max) return 'Above Range';
    return 'Within Range';
}

const DEFAULT_RANGES = {
    HOCl: { min: 0.5, max: 2.5, unit: 'ppm' },
    pH: { min: 6.0, max: 8.0, unit: 'pH' },
};

function toDateStr(date) {
    return date.toISOString().slice(0, 10);
}

function formatRow(row) {
    return {
        result_id: row.result_id,
        test_type: row.test_type,
        estimated_value: row.estimated_value,
        unit: row.unit,
        detected_color_hex: row.detected_color_hex,
        detected_color_hex_2: row.detected_color_hex_2,
        detected_color_label: row.detected_color_label,
        result_status: row.result_status,
        sync_status: row.sync_status,
        device_name: row.device_name_snapshot,
        device_serial: row.device_serial_snapshot,
        notes: row.notes_from_mobile,
        is_retest: row.retest_of_result_id !== null,
        tested_at: row.tested_at,
        synced_at: row.synced_at,
    };
}

function groupByDate(rows) {
    const now = new Date();
    const todayStr = toDateStr(now);
    const yestStr = toDateStr(new Date(now - 86400000));

    const buckets = {};

    for (const row of rows) {
        const ds = toDateStr(new Date(row.tested_at));
        let label;
        if (ds === todayStr) label = 'Today';
        else if (ds === yestStr) label = 'Yesterday';
        else label = new Date(row.tested_at)
            .toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            })
            .toUpperCase();

        if (!buckets[label]) buckets[label] = [];
        buckets[label].push(formatRow(row));
    }

    return Object.entries(buckets).map(([date_label, results]) => ({
        date_label,
        results,
    }));
}

const syncMobileResultService = async ({ test_type, test_value, device_name, user }) => {

    const value = parseFloat(test_value);

    const device = await Device.findOne({
        where: {
            device_name,
            facility_id: user.facility_id,
            organization_id: user.organization_id,
        },
    });

    if (!device) {
        const availableDevices = await Device.findAll({
            where: {
                facility_id: user.facility_id,
                organization_id: user.organization_id,
                status: 'Active',
            },
            attributes: ['device_name', 'serial_number'],
        });

        return {
            status: 404,
            success: false,
            message: `Device "${device_name}" not found in your facility.`,
            available_devices: availableDevices.map(d => ({
                device_name: d.device_name,
                serial_number: d.serial_number,
            })),
        };
    }

    const range = DEFAULT_RANGES[test_type];

    const detectedColorHex = getColorHex(test_type, value);
    const detectedColorHex2 = test_type === 'HOCl' ? getColorHex('HOCl_blue', value) : null;
    const detectedColorLabel = getColorLabel(detectedColorHex);

    const resultStatus = deriveStatus(test_type, value, range.min, range.max);

    const userRecord = await User.findByPk(user.user_id, {
        attributes: ['first_name', 'last_name', 'role'],
    });

    const now = new Date();

    const row = {
        result_id: uuidv4(),
        organization_id: user.organization_id,
        facility_id: user.facility_id,

        user_id: user.user_id,
        user_name_snapshot: userRecord ? `${userRecord.first_name} ${userRecord.last_name}` : null,
        user_role_snapshot: userRecord?.role ?? null,

        device_id: device.device_id,
        device_name_snapshot: device.device_name,
        device_serial_snapshot: device.serial_number,

        test_type,
        cartridge_type: test_type,
        estimated_value: value.toFixed(4),
        unit: range.unit,

        detected_color_hex: detectedColorHex,
        detected_color_hex_2: detectedColorHex2,
        detected_color_label: detectedColorLabel,

        accepted_min_value: range.min.toFixed(4),
        accepted_max_value: range.max.toFixed(4),

        result_status: resultStatus,
        notes_from_mobile: null,
        retest_of_result_id: null,
        sync_status: 'Synced',

        tested_at: now,
        synced_at: now,
    };

    const created = await TestResult.create(row);

    return {
        status: 201,
        success: true,
        message: 'Test result synced successfully.',
        data: {
            result_id: created.result_id,
            test_type: created.test_type,
            cartridge_type: created.cartridge_type,
            estimated_value: created.estimated_value,
            unit: created.unit,
            detected_color_hex: created.detected_color_hex,
            detected_color_hex_2: created.detected_color_hex_2,
            detected_color_label: created.detected_color_label,
            accepted_min_value: created.accepted_min_value,
            accepted_max_value: created.accepted_max_value,
            result_status: created.result_status,
            user_id: created.user_id,
            user_name_snapshot: created.user_name_snapshot,
            user_role_snapshot: created.user_role_snapshot,
            device_id: created.device_id,
            device_name_snapshot: created.device_name_snapshot,
            device_serial_snapshot: created.device_serial_snapshot,
            facility_id: created.facility_id,
            organization_id: created.organization_id,
            sync_status: created.sync_status,
            notes_from_mobile: created.notes_from_mobile,
            retest_of_result_id: created.retest_of_result_id,
            tested_at: created.tested_at,
            synced_at: created.synced_at,
        },
    };
};

const getMobileResultsService = async ({ user, test_type, result_status, search, page, limit }) => {

    const pageNum = Math.max(1, parseInt(page ?? 1));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? 20)));
    const offset = (pageNum - 1) * limitNum;

    const where = {
        organization_id: user.organization_id,
        facility_id: user.facility_id,
        user_id: user.user_id,
    };

    if (test_type) where.test_type = test_type;
    if (result_status) where.result_status = result_status;

    if (search) {
        const q = `%${search.trim()}%`;
        where[Op.or] = [
            { device_name_snapshot: { [Op.iLike]: q } },
            { notes_from_mobile: { [Op.iLike]: q } },
        ];
    }

    const { count, rows } = await TestResult.findAndCountAll({
        where,
        order: [['tested_at', 'DESC']],
        limit: limitNum,
        offset,
        attributes: [
            'result_id',
            'test_type',
            'estimated_value',
            'unit',
            'detected_color_hex',
            'detected_color_hex_2',
            'detected_color_label',
            'result_status',
            'sync_status',
            'device_name_snapshot',
            'device_serial_snapshot',
            'notes_from_mobile',
            'retest_of_result_id',
            'tested_at',
            'synced_at',
        ],
    });

    const grouped = groupByDate(rows);
    const totalPages = Math.ceil(count / limitNum);

    return {
        status: 200,
        success: true,
        message: 'Results fetched.',
        data: {
            grouped,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                total_pages: totalPages,
                has_next: pageNum < totalPages,
                has_prev: pageNum > 1,
            },
        },
    };
};

module.exports = { syncMobileResultService, getMobileResultsService };