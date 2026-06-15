'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TestResult extends Model {
        static associate(models) {
            TestResult.belongsTo(models.Organization, {
                foreignKey: 'organization_id',
                as: 'organization',
            });
            TestResult.belongsTo(models.Facility, {
                foreignKey: 'facility_id',
                as: 'facility',
            });
            TestResult.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
                constraints: false,
            });
            TestResult.belongsTo(models.Device, {
                foreignKey: 'device_id',
                as: 'device',
                constraints: false,
            });
            TestResult.belongsTo(models.TestResult, {
                foreignKey: 'retest_of_result_id',
                as: 'originalResult',
                constraints: false,
            });
            TestResult.hasMany(models.TestResult, {
                foreignKey: 'retest_of_result_id',
                as: 'retests',
                constraints: false,
            });
        }


        get isInRange() {
            return this.result_status === 'Within Range';
        }

        get isFailed() {
            return ['Above Range', 'Below Range', 'Invalid Reading'].includes(this.result_status);
        }

        get isRetest() {
            return this.retest_of_result_id !== null;
        }

        get displayValue() {
            if (this.estimated_value === null) return 'N/A';
            return `${parseFloat(this.estimated_value).toFixed(2)} ${this.unit}`;
        }
    }

    TestResult.init(
        {
            result_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            organization_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            facility_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: true,
                comment: 'Soft reference — no FK; user may be deleted',
            },
            user_name_snapshot: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            user_role_snapshot: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            device_id: {
                type: DataTypes.UUID,
                allowNull: true,
                comment: 'Soft reference — no FK; device may be removed',
            },
            device_name_snapshot: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            device_serial_snapshot: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            test_type: {
                type: DataTypes.ENUM('HOCl', 'pH'),
                allowNull: false,
            },
            cartridge_type: {
                type: DataTypes.ENUM('HOCl', 'pH'),
                allowNull: false,
            },
            estimated_value: {
                type: DataTypes.DECIMAL(10, 4),
                allowNull: true,
            },
            unit: {
                type: DataTypes.ENUM('ppm', 'pH'),
                allowNull: false,
            },
            detected_color_hex: {
                type: DataTypes.STRING(7),
                allowNull: true,
            },
            detected_color_hex_2: {
                type: DataTypes.STRING(7),
                allowNull: true,
                comment: 'Second pad color (HOCl blue pad)',
            },
            detected_color_label: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            accepted_min_value: {
                type: DataTypes.DECIMAL(10, 4),
                allowNull: true,
            },
            accepted_max_value: {
                type: DataTypes.DECIMAL(10, 4),
                allowNull: true,
            },
            result_status: {
                type: DataTypes.ENUM(
                    'Within Range',
                    'Below Range',
                    'Above Range',
                    'Invalid Reading',
                    'Needs Attention'
                ),
                allowNull: false,
            },
            notes_from_mobile: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            retest_of_result_id: {
                type: DataTypes.UUID,
                allowNull: true,
                comment: 'Soft reference to the original result this is a retest of',
            },
            sync_status: {
                type: DataTypes.ENUM('Synced', 'Pending Sync', 'Sync Failed'),
                defaultValue: 'Synced',
                allowNull: false,
            },
            tested_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            synced_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'TestResult',
            tableName: 'test_results',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return TestResult;
};