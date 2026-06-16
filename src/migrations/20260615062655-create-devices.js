'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
      device_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'organization_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      facility_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'facilities', key: 'facility_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      device_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      serial_number: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      location_label: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      connection_status: {
        type: Sequelize.ENUM('Connected', 'Offline', 'Not Detected', 'Maintenance'),
        defaultValue: 'Not Detected',
        allowNull: false,
      },
      power_status: {
        type: Sequelize.ENUM('DC Power Connected', 'Device Offline', 'Device Not Detected'),
        allowNull: true,
      },
      firmware_version: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      last_connected_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_sync_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive', 'Deactivated'),
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

    await queryInterface.addIndex('devices', ['organization_id']);
    await queryInterface.addIndex('devices', ['facility_id']);
    await queryInterface.addIndex('devices', ['status']);
    await queryInterface.addIndex('devices', ['serial_number']);
    await queryInterface.addIndex('devices', ['last_sync_at']);
    await queryInterface.addIndex('devices', ['connection_status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('devices');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_devices_connection_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_devices_power_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_devices_status";');
  },
};