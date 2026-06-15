'use strict';

const { v4: uuidv4 } = require('uuid');
const {
    ORG_ID,
    FACILITY_A, FACILITY_B, FACILITY_C,
    AVERY_ID, MARIA_ID, JAMAL_ID,
    DEVICE_007, DEVICE_012, DEVICE_014, DEVICE_021,
} = require('../utils/seederConstants');

function mapStatus(s) {
    switch (s) {
        case 'in_range': return 'Within Range';
        case 'out_of_range': return 'Above Range';
        case 'needs_attention': return 'Needs Attention';
        case 'invalid': return 'Invalid Reading';
        default: return 'Within Range';
    }
}

function makeRows(tested_at, facility_id, {
    userId, userName, userRole,
    deviceId, deviceName, deviceSerial,
    hocl, hoclHex, hoclBlue, hoclStatus,
    ph, phHex, phStatus,
    notes,
}) {
    const base = {
        organization_id: ORG_ID,
        facility_id,
        user_id: userId,
        user_name_snapshot: userName,
        user_role_snapshot: userRole,
        device_id: deviceId,
        device_name_snapshot: deviceName,
        device_serial_snapshot: deviceSerial,
        retest_of_result_id: null,
        sync_status: 'Synced',
        tested_at: new Date(tested_at),
        synced_at: new Date(tested_at),
        created_at: new Date(),
        updated_at: new Date(),
        notes_from_mobile: notes ?? null,
    };

    return [
        {
            ...base,
            result_id: uuidv4(),
            test_type: 'HOCl',
            cartridge_type: 'HOCl',
            estimated_value: hocl !== null ? (hocl * 40).toFixed(4) : null,
            unit: 'ppm',
            detected_color_hex: hoclHex,
            detected_color_hex_2: hoclBlue,
            detected_color_label: hoclHex === '#e6e6e6' ? 'No color detected' : 'Yellow pad',
            accepted_min_value: '50.0000',
            accepted_max_value: '100.0000',
            result_status: mapStatus(hoclStatus),
        },
        {
            ...base,
            result_id: uuidv4(),
            test_type: 'pH',
            cartridge_type: 'pH',
            estimated_value: ph !== null ? ph.toFixed(4) : null,
            unit: 'pH',
            detected_color_hex: phHex,
            detected_color_hex_2: null,
            detected_color_label: phHex === '#e6e6e6' ? 'No color detected' : 'Blue-Green',
            accepted_min_value: '6.0000',
            accepted_max_value: '8.0000',
            result_status: mapStatus(phStatus),
        },
    ];
}

module.exports = {
    async up(queryInterface) {
        const rows = [
            ...makeRows('2026-06-09 09:14:00', FACILITY_A, {
                userId: AVERY_ID, userName: 'Avery Thompson', userRole: 'Facility Admin',
                deviceId: DEVICE_014, deviceName: 'Line 2 Tester', deviceSerial: 'SN-MTR-D-014',
                hocl: 1.82, hoclHex: '#f4c95d', hoclBlue: '#5b9fd6', hoclStatus: 'in_range',
                ph: 7.1, phHex: '#9cc7a0', phStatus: 'in_range',
            }),
            ...makeRows('2026-06-09 08:52:00', FACILITY_A, {
                userId: MARIA_ID, userName: 'Maria Reyes', userRole: 'Supervisor',
                deviceId: DEVICE_012, deviceName: 'Line 1 Tester', deviceSerial: 'SN-MTR-D-012',
                hocl: 0.42, hoclHex: '#fde9b8', hoclBlue: '#bcd9ec', hoclStatus: 'out_of_range',
                ph: 6.4, phHex: '#d2e2b1', phStatus: 'needs_attention',
                notes: 'Re-test required',
            }),
            ...makeRows('2026-06-09 08:31:00', FACILITY_B, {
                userId: JAMAL_ID, userName: 'Jamal Okafor', userRole: 'Testing Staff',
                deviceId: DEVICE_021, deviceName: 'Cold Room Tester', deviceSerial: 'SN-MTR-D-021',
                hocl: 2.05, hoclHex: '#e8b94a', hoclBlue: '#3f86c2', hoclStatus: 'in_range',
                ph: 7.4, phHex: '#7fb589', phStatus: 'in_range',
            }),
            ...makeRows('2026-06-09 08:10:00', FACILITY_B, {
                userId: JAMAL_ID, userName: 'Jamal Okafor', userRole: 'Testing Staff',
                deviceId: DEVICE_021, deviceName: 'Cold Room Tester', deviceSerial: 'SN-MTR-D-021',
                hocl: 1.61, hoclHex: '#f1c25a', hoclBlue: '#5293ce', hoclStatus: 'in_range',
                ph: 7.0, phHex: '#9cc7a0', phStatus: 'in_range',
            }),
            ...makeRows('2026-06-09 07:48:00', FACILITY_C, {
                userId: MARIA_ID, userName: 'Maria Reyes', userRole: 'Supervisor',
                deviceId: DEVICE_007, deviceName: 'Pack Line Tester', deviceSerial: 'SN-MTR-D-007',
                hocl: 3.14, hoclHex: '#c98a2b', hoclBlue: '#1f5f97', hoclStatus: 'out_of_range',
                ph: 8.1, phHex: '#4f8a5c', phStatus: 'out_of_range',
                notes: 'Above max threshold',
            }),
            ...makeRows('2026-06-09 07:22:00', FACILITY_A, {
                userId: AVERY_ID, userName: 'Avery Thompson', userRole: 'Facility Admin',
                deviceId: DEVICE_014, deviceName: 'Line 2 Tester', deviceSerial: 'SN-MTR-D-014',
                hocl: null, hoclHex: '#e6e6e6', hoclBlue: '#e6e6e6', hoclStatus: 'invalid',
                ph: null, phHex: '#e6e6e6', phStatus: 'invalid',
                notes: 'Cartridge read error',
            }),
            ...makeRows('2026-06-08 18:02:00', FACILITY_A, {
                userId: MARIA_ID, userName: 'Maria Reyes', userRole: 'Supervisor',
                deviceId: DEVICE_012, deviceName: 'Line 1 Tester', deviceSerial: 'SN-MTR-D-012',
                hocl: 1.75, hoclHex: '#f4c95d', hoclBlue: '#5b9fd6', hoclStatus: 'in_range',
                ph: 6.9, phHex: '#cfe0ad', phStatus: 'needs_attention',
            }),
            ...makeRows('2026-06-08 17:41:00', FACILITY_C, {
                userId: JAMAL_ID, userName: 'Jamal Okafor', userRole: 'Testing Staff',
                deviceId: DEVICE_007, deviceName: 'Pack Line Tester', deviceSerial: 'SN-MTR-D-007',
                hocl: 1.93, hoclHex: '#eebd4f', hoclBlue: '#4a8fcb', hoclStatus: 'in_range',
                ph: 7.2, phHex: '#8fc095', phStatus: 'in_range',
            }),
            ...makeRows('2026-06-08 16:33:00', FACILITY_B, {
                userId: JAMAL_ID, userName: 'Jamal Okafor', userRole: 'Testing Staff',
                deviceId: DEVICE_021, deviceName: 'Cold Room Tester', deviceSerial: 'SN-MTR-D-021',
                hocl: 2.18, hoclHex: '#e3b245', hoclBlue: '#3279bb', hoclStatus: 'in_range',
                ph: 7.5, phHex: '#7fb589', phStatus: 'in_range',
            }),
            ...makeRows('2026-06-08 15:11:00', FACILITY_A, {
                userId: AVERY_ID, userName: 'Avery Thompson', userRole: 'Facility Admin',
                deviceId: DEVICE_014, deviceName: 'Line 2 Tester', deviceSerial: 'SN-MTR-D-014',
                hocl: 1.55, hoclHex: '#f1c25a', hoclBlue: '#5293ce', hoclStatus: 'in_range',
                ph: 7.0, phHex: '#9cc7a0', phStatus: 'in_range',
            }),
        ];

        await queryInterface.bulkInsert('test_results', rows);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('test_results', {
            organization_id: ORG_ID,
        });
    },
};