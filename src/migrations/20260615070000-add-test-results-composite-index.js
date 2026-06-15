'use strict';

module.exports = {
    async up(queryInterface) {
        await queryInterface.addIndex('test_results', ['facility_id', 'tested_at'], {
            name: 'test_results_facility_tested_at_idx',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('test_results', 'test_results_facility_tested_at_idx');
    },
};