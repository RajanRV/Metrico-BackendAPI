'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_results', {
      result_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      facility_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      user_name_snapshot: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      user_role_snapshot: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      device_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      device_name_snapshot: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      device_serial_snapshot: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      test_type: {
        type: Sequelize.ENUM('HOCl', 'pH'),
        allowNull: false,
      },
      cartridge_type: {
        type: Sequelize.ENUM('HOCl', 'pH'),
        allowNull: false,
      },
      estimated_value: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      detected_color_hex: {
        type: Sequelize.STRING(7),
        allowNull: false,
      },
      detected_color_hex_yellow: {
        type: Sequelize.STRING(7),
        allowNull: true,

      },
      detected_color_hex_blue: {
        type: Sequelize.STRING(7),
        allowNull: true,

      },
      detected_color_label: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      accepted_min_value: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      accepted_max_value: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      result_status: {
        type: Sequelize.ENUM('Within Range', 'Below Range', 'Above Range', 'Invalid Reading'),
        allowNull: false,
      },
      notes_from_mobile: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      retest_of_result_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      sync_status: {
        type: Sequelize.ENUM('Synced', 'Pending Sync', 'Sync Failed'),
        allowNull: false,
        defaultValue: 'Synced',
      },
      tested_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      synced_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Indexes for performance (per spec)
    await queryInterface.addIndex('test_results', ['facility_id']);
    await queryInterface.addIndex('test_results', ['tested_at']);
    await queryInterface.addIndex('test_results', ['test_type']);
    await queryInterface.addIndex('test_results', ['result_status']);
    await queryInterface.addIndex('test_results', ['device_id']);
    await queryInterface.addIndex('test_results', ['user_id']);
    await queryInterface.addIndex('test_results', ['sync_status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('test_results');
  },
};