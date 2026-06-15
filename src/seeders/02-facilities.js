'use strict';

const { ORG_ID, FACILITY_A, FACILITY_B, FACILITY_C } = require('../utils/seederConstants');

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('facilities', [
            {
                facility_id: FACILITY_A,
                organization_id: ORG_ID,
                facility_name: 'Plant A',
                address: '1 Industrial Ave, Plant A',
                timezone: 'UTC',
                status: 'Active',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                facility_id: FACILITY_B,
                organization_id: ORG_ID,
                facility_name: 'Plant B',
                address: '2 Industrial Ave, Plant B',
                timezone: 'UTC',
                status: 'Active',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                facility_id: FACILITY_C,
                organization_id: ORG_ID,
                facility_name: 'Plant C',
                address: '3 Industrial Ave, Plant C',
                timezone: 'UTC',
                status: 'Active',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('facilities', {
            facility_id: [FACILITY_A, FACILITY_B, FACILITY_C],
        });
    },
};