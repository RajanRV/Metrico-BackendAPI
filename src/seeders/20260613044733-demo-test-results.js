'use strict';

const ADMIN_ID    = 'a1b2c3d4-0000-0000-0000-000000000003';
const SUPER_ID    = 'a1b2c3d4-0000-0000-0000-000000000004';
const ORG_ID      = 'b1000000-0000-0000-0000-000000000001';
const FACILITY_ID = 'c1000000-0000-0000-0000-000000000001';
const DEVICE_1    = 'd1000000-0000-0000-0000-000000000001';
const DEVICE_2    = 'd1000000-0000-0000-0000-000000000002';

const { v4: uuidv4 } = require('uuid');

const HOCL_COLORS = [
  { yellowHex: '#fde9b8', blueHex: '#bcd9ec', label: 'Very Light' },   // < 40 ppm
  { yellowHex: '#f4c95d', blueHex: '#5b9fd6', label: 'Light Yellow' }, // 40–70 ppm
  { yellowHex: '#f1c25a', blueHex: '#5293ce', label: 'Yellow' },       // 70–85 ppm
  { yellowHex: '#e8b94a', blueHex: '#3f86c2', label: 'Deep Yellow' },  // 85–100 ppm
  { yellowHex: '#c98a2b', blueHex: '#1f5f97', label: 'Orange' },       // > 100 ppm
]

function getHoclColors(value) {
  if (value === null) return { yellowHex: '#d1d5db', blueHex: '#d1d5db', label: 'Invalid' }
  if (value < 40)    return HOCL_COLORS[0]
  if (value < 70)    return HOCL_COLORS[1]
  if (value < 85)    return HOCL_COLORS[2]
  if (value <= 100)  return HOCL_COLORS[3]
  return HOCL_COLORS[4]
}

function getPhColors(value) {
  if (value === null) return { hex: '#d1d5db', label: 'Invalid' }
  if (value < 5.5)   return { hex: '#f4a460', label: 'Orange' }
  if (value < 6.0)   return { hex: '#d2e2b1', label: 'Light Green' }
  if (value < 6.8)   return { hex: '#a8c97a', label: 'Yellow Green' }
  if (value <= 7.4)  return { hex: '#9cc7a0', label: 'Green' }
  if (value <= 8.0)  return { hex: '#7fb589', label: 'Deep Green' }
  return { hex: '#4f8a5c', label: 'Dark Green' }
}

function getHoclStatus(value) {
  if (value === null) return 'Invalid Reading'
  if (value < 50)    return 'Below Range'
  if (value > 100)   return 'Above Range'
  return 'Within Range'
}

function getPhStatus(value) {
  if (value === null) return 'Invalid Reading'
  if (value < 6.0)   return 'Below Range'
  if (value > 8.0)   return 'Above Range'
  return 'Within Range'
}

function randomBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4))
}

function daysAgo(days, hourOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hourOffset, 0, 0, 0)
  return d
}

function parseTs(ts) {
  // "2026-06-09 09:14" → Date
  return new Date(ts.replace(' ', 'T') + ':00.000Z')
}

module.exports = {
  async up(queryInterface) {
    const now = new Date()

    await queryInterface.bulkInsert('organizations', [{
      organization_id: ORG_ID,
      organization_name: 'Metrico Demo Org',
      status: 'Active',
      created_at: now,
      updated_at: now,
    }], { ignoreDuplicates: true })

    await queryInterface.bulkInsert('facilities', [{
      facility_id: FACILITY_ID,
      organization_id: ORG_ID,
      facility_name: 'Main Facility',
      address: '123 Demo Street, Test City',
      timezone: 'UTC',
      status: 'Active',
      created_at: now,
      updated_at: now,
    }], { ignoreDuplicates: true })

    await queryInterface.bulkUpdate(
      'users',
      { organization_id: ORG_ID, facility_id: FACILITY_ID },
      { user_id: [ADMIN_ID, SUPER_ID] }
    )

    await queryInterface.bulkInsert('devices', [
      {
        device_id: DEVICE_1,
        device_name: 'Metrico Unit 01',
        serial_number: 'MU-001-2026',
        organization_id: ORG_ID,
        facility_id: FACILITY_ID,
        connection_status: 'Connected',
        power_status: 'DC Power Connected',
        firmware_version: '1.0.4',
        last_connected_at: now,
        last_sync_at: now,
        status: 'Active',
        created_at: now,
        updated_at: now,
      },
      {
        device_id: DEVICE_2,
        device_name: 'Metrico Unit 02',
        serial_number: 'MU-002-2026',
        organization_id: ORG_ID,
        facility_id: FACILITY_ID,
        connection_status: 'Offline',
        power_status: 'Device Offline',
        firmware_version: '1.0.3',
        last_connected_at: daysAgo(2),
        last_sync_at: daysAgo(2),
        status: 'Active',
        created_at: now,
        updated_at: now,
      },
    ], { ignoreDuplicates: true })

    const results = []

    const addResult = (opts) => {
      let detectedColorHex, detectedColorLabel, yellowHex, blueHex

      if (opts.test_type === 'HOCl') {
        // Allow explicit color override (for dummy data), else derive from value
        if (opts.yellowHex && opts.blueHex) {
          yellowHex        = opts.yellowHex
          blueHex          = opts.blueHex
          detectedColorHex = opts.yellowHex
          detectedColorLabel = opts.colorLabel || getHoclColors(opts.value).label
        } else {
          const c          = getHoclColors(opts.value)
          detectedColorHex = c.yellowHex
          detectedColorLabel = c.label
          yellowHex        = c.yellowHex
          blueHex          = c.blueHex
        }
      } else {
        // Allow explicit color override (for dummy data)
        if (opts.phHex) {
          detectedColorHex  = opts.phHex
          detectedColorLabel = opts.colorLabel || getPhColors(opts.value).label
        } else {
          const c           = getPhColors(opts.value)
          detectedColorHex  = c.hex
          detectedColorLabel = c.label
        }
        yellowHex = null
        blueHex   = null
      }

      results.push({
        result_id:              uuidv4(),
        organization_id:        ORG_ID,
        facility_id:            FACILITY_ID,
        user_id:                opts.user_id,
        user_name_snapshot:     opts.user_name,
        user_role_snapshot:     opts.user_role,
        device_id:              opts.device_id,
        device_name_snapshot:   opts.device_name,
        device_serial_snapshot: opts.device_serial,
        test_type:              opts.test_type,
        cartridge_type:         opts.test_type,
        estimated_value:        opts.value,
        unit:                   opts.test_type === 'HOCl' ? 'ppm' : 'pH',
        detected_color_hex:     detectedColorHex,
        detected_color_hex_yellow: yellowHex,
        detected_color_hex_blue:   blueHex,
        detected_color_label:   detectedColorLabel,
        accepted_min_value:     opts.test_type === 'HOCl' ? 50 : 6.0,
        accepted_max_value:     opts.test_type === 'HOCl' ? 100 : 8.0,
        result_status:          opts.status,
        notes_from_mobile:      opts.notes || null,
        retest_of_result_id:    null,
        sync_status:            'Synced',
        tested_at:              opts.tested_at,
        synced_at:              opts.tested_at,
        created_at:             opts.tested_at,
        updated_at:             opts.tested_at,
      })
    }

    // ─── Fixed dummy data from data.ts ────────────────────────────────────────
    // Each TestResult in data.ts has both hocl + ph, so we push two rows each.
    // operator → user_name_snapshot (abbreviated in data.ts, expand here)
    const DUMMY = [
      {
        id: 'MTR-10428', ts: '2026-06-09 09:14',
        operator: 'J. Okafor', device: 'MTR-D-014',
        hocl: 1.82,  hoclYellow: '#f4c95d', hoclBlue: '#5b9fd6', hoclStatus: 'Within Range',
        ph: 7.1,     phColor: '#9cc7a0',   phStatus: 'Within Range',
      },
      {
        id: 'MTR-10427', ts: '2026-06-09 08:52',
        operator: 'M. Reyes', device: 'MTR-D-012',
        hocl: 0.42,  hoclYellow: '#fde9b8', hoclBlue: '#bcd9ec', hoclStatus: 'Below Range',
        ph: 6.4,     phColor: '#d2e2b1',   phStatus: 'Within Range',
        notes: 'Re-test required',
      },
      {
        id: 'MTR-10426', ts: '2026-06-09 08:31',
        operator: 'S. Müller', device: 'MTR-D-021',
        hocl: 2.05,  hoclYellow: '#e8b94a', hoclBlue: '#3f86c2', hoclStatus: 'Within Range',
        ph: 7.4,     phColor: '#7fb589',   phStatus: 'Within Range',
      },
      {
        id: 'MTR-10425', ts: '2026-06-09 08:10',
        operator: 'S. Müller', device: 'MTR-D-021',
        hocl: 1.61,  hoclYellow: '#f1c25a', hoclBlue: '#5293ce', hoclStatus: 'Within Range',
        ph: 7.0,     phColor: '#9cc7a0',   phStatus: 'Within Range',
      },
      {
        id: 'MTR-10424', ts: '2026-06-09 07:48',
        operator: 'A. Chen', device: 'MTR-D-007',
        hocl: 3.14,  hoclYellow: '#c98a2b', hoclBlue: '#1f5f97', hoclStatus: 'Above Range',
        ph: 8.1,     phColor: '#4f8a5c',   phStatus: 'Above Range',
        notes: 'Above max threshold',
      },
      {
        id: 'MTR-10423', ts: '2026-06-09 07:22',
        operator: 'J. Okafor', device: 'MTR-D-014',
        hocl: null,  hoclYellow: '#d1d5db', hoclBlue: '#d1d5db', hoclStatus: 'Invalid Reading',
        ph: null,    phColor: '#d1d5db',   phStatus: 'Invalid Reading',
        notes: 'Cartridge read error',
      },
      {
        id: 'MTR-10422', ts: '2026-06-08 18:02',
        operator: 'M. Reyes', device: 'MTR-D-012',
        hocl: 1.75,  hoclYellow: '#f4c95d', hoclBlue: '#5b9fd6', hoclStatus: 'Within Range',
        ph: 6.9,     phColor: '#cfe0ad',   phStatus: 'Within Range',
      },
      {
        id: 'MTR-10421', ts: '2026-06-08 17:41',
        operator: 'A. Chen', device: 'MTR-D-007',
        hocl: 1.93,  hoclYellow: '#eebd4f', hoclBlue: '#4a8fcb', hoclStatus: 'Within Range',
        ph: 7.2,     phColor: '#8fc095',   phStatus: 'Within Range',
      },
      {
        id: 'MTR-10420', ts: '2026-06-08 16:33',
        operator: 'S. Müller', device: 'MTR-D-021',
        hocl: 2.18,  hoclYellow: '#e3b245', hoclBlue: '#3279bb', hoclStatus: 'Within Range',
        ph: 7.5,     phColor: '#7fb589',   phStatus: 'Within Range',
      },
      {
        id: 'MTR-10419', ts: '2026-06-08 15:11',
        operator: 'J. Okafor', device: 'MTR-D-014',
        hocl: 1.55,  hoclYellow: '#f1c25a', hoclBlue: '#5293ce', hoclStatus: 'Within Range',
        ph: 7.0,     phColor: '#9cc7a0',   phStatus: 'Within Range',
      },
    ]

    for (const d of DUMMY) {
      const ts = parseTs(d.ts)

      // HOCl row
      addResult({
        user_id: ADMIN_ID, user_name: d.operator, user_role: 'Testing Staff',
        device_id: DEVICE_1, device_name: d.device, device_serial: 'MU-001-2026',
        test_type: 'HOCl',
        value: d.hocl,
        yellowHex: d.hoclYellow,
        blueHex: d.hoclBlue,
        status: d.hoclStatus,
        tested_at: ts,
        notes: d.notes || null,
      })

      // pH row
      addResult({
        user_id: ADMIN_ID, user_name: d.operator, user_role: 'Testing Staff',
        device_id: DEVICE_1, device_name: d.device, device_serial: 'MU-001-2026',
        test_type: 'pH',
        value: d.ph,
        phHex: d.phColor,
        status: d.phStatus,
        tested_at: ts,
      })
    }

    // ─── Random generated data (last 7 days) ──────────────────────────────────
    const seedUsers = [
      { id: ADMIN_ID, name: 'Super Admin',     role: 'Admin',      device_id: DEVICE_1, device_name: 'Metrico Unit 01', device_serial: 'MU-001-2026' },
      { id: SUPER_ID, name: 'John Supervisor', role: 'Supervisor', device_id: DEVICE_2, device_name: 'Metrico Unit 02', device_serial: 'MU-002-2026' },
    ]

    for (let day = 6; day >= 0; day--) {
      for (let hour = 8; hour <= 18; hour += 2) {
        for (const user of seedUsers) {
          const hoclValue = randomBetween(30, 130)
          addResult({
            user_id: user.id, user_name: user.name, user_role: user.role,
            device_id: user.device_id, device_name: user.device_name, device_serial: user.device_serial,
            test_type: 'HOCl',
            value: hoclValue,
            status: getHoclStatus(hoclValue),
            tested_at: daysAgo(day, hour),
            notes: hoclValue < 50 ? 'Re-check recommended' : null,
          })

          const phValue = randomBetween(5.0, 9.0)
          addResult({
            user_id: user.id, user_name: user.name, user_role: user.role,
            device_id: user.device_id, device_name: user.device_name, device_serial: user.device_serial,
            test_type: 'pH',
            value: phValue,
            status: getPhStatus(phValue),
            tested_at: daysAgo(day, hour),
          })
        }
      }
    }

    // ─── Invalid reading records ───────────────────────────────────────────────
    addResult({
      user_id: ADMIN_ID, user_name: 'Super Admin', user_role: 'Admin',
      device_id: DEVICE_1, device_name: 'Metrico Unit 01', device_serial: 'MU-001-2026',
      test_type: 'HOCl', value: null, status: 'Invalid Reading',
      tested_at: daysAgo(1, 10), notes: 'Cartridge error',
    })
    addResult({
      user_id: SUPER_ID, user_name: 'John Supervisor', user_role: 'Supervisor',
      device_id: DEVICE_2, device_name: 'Metrico Unit 02', device_serial: 'MU-002-2026',
      test_type: 'pH', value: null, status: 'Invalid Reading',
      tested_at: daysAgo(1, 14),
    })

    await queryInterface.bulkInsert('test_results', results)
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('test_results', { facility_id: FACILITY_ID })
    await queryInterface.bulkDelete('devices', { facility_id: FACILITY_ID })
    await queryInterface.bulkDelete('facilities', { facility_id: FACILITY_ID })
    await queryInterface.bulkDelete('organizations', { organization_id: ORG_ID })
  },
}