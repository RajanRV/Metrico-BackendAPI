'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'organization_id', {
      type: Sequelize.UUID,
      allowNull: true, // true during migration; tighten after data backfill
    });

    await queryInterface.addColumn('users', 'facility_id', {
      type: Sequelize.UUID,
      allowNull: true, // true during migration; tighten after data backfill
    });

    await queryInterface.addIndex('users', ['organization_id']);
    await queryInterface.addIndex('users', ['facility_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'organization_id');
    await queryInterface.removeColumn('users', 'facility_id');
  },
};