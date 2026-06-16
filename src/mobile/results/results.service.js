'use strict';

const { v4: uuidv4 } = require('uuid');
const { TestResult, Device, User } = require('../../models');
const { getColorHex, getColorLabel } = require('../../utils/colorMap');

function deriveStatus(testType, value, minVal, maxVal) {
    if (value === null || value === undefined) return 'Invalid Reading';
    const v = parseFloat(value);
    const min = parseFloat(minVal);
    const max = parseFloat(maxVal);
    if (v < min) return 'Below Range';
    if (v > max) return 'Above Range';
    return 'Within Range';
}

const DEFAULT_RANGES = {
    HOCl: { min: 0.5, max: 2.5, unit: 'ppm' },
    pH: { min: 6.0, max: 8.0, unit: 'pH' },
};

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

module.exports = { syncMobileResultService };