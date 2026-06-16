'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    // ✅ Explicitly create ENUM types first to avoid PostgreSQL resolution errors
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_test_results_test_type" AS ENUM ('HOCl', 'pH');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_test_results_cartridge_type" AS ENUM ('HOCl', 'pH');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_test_results_unit" AS ENUM ('ppm', 'pH');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_test_results_result_status" AS ENUM (
          'Within Range', 'Below Range', 'Above Range', 'Invalid Reading', 'Needs Attention'
        );
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_test_results_sync_status" AS ENUM ('Synced', 'Pending Sync', 'Sync Failed');
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('test_results', {
      result_id: {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      user_name_snapshot: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      user_role_snapshot: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      device_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      device_name_snapshot: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      device_serial_snapshot: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
        type: Sequelize.ENUM('ppm', 'pH'),
        allowNull: false,
      },
      detected_color_hex: {
        type: Sequelize.STRING(7),
        allowNull: true,
      },
      detected_color_label: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      accepted_min_value: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      accepted_max_value: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      result_status: {
        type: Sequelize.ENUM(
          'Within Range', 'Below Range', 'Above Range', 'Invalid Reading', 'Needs Attention'
        ),
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
        defaultValue: 'Synced',
        allowNull: false,
      },
      tested_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      synced_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('test_results', ['facility_id']);
    await queryInterface.addIndex('test_results', ['organization_id']);
    await queryInterface.addIndex('test_results', ['tested_at']);
    await queryInterface.addIndex('test_results', ['test_type']);
    await queryInterface.addIndex('test_results', ['result_status']);
    await queryInterface.addIndex('test_results', ['device_id']);
    await queryInterface.addIndex('test_results', ['user_id']);
    await queryInterface.addIndex('test_results', ['sync_status']);

    await queryInterface.addIndex('test_results', ['facility_id', 'tested_at'], {
      name: 'test_results_facility_tested_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('test_results');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_test_results_test_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_test_results_cartridge_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_test_results_unit";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_test_results_result_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_test_results_sync_status";');
  },
};