'use strict';

const { ORG_ID } = require('../utils/seederConstants');

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('organizations', [
            {
                organization_id: ORG_ID,
                organization_name: 'Metrico Demo Org',
                status: 'Active',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('organizations', {
            organization_id: ORG_ID,
        });
    },
};