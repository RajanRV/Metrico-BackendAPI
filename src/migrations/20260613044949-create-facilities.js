'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('facilities', {
      facility_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key:   'organization_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      facility_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      timezone: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'UTC',
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('facilities', ['organization_id']);
    await queryInterface.addIndex('facilities', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('facilities');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_facilities_status";');
  },
};