module.exports = (sequelize, DataTypes) => {
    const TestResult = sequelize.define(
        'TestResult',
        {
            result_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
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
                allowNull: false,
            },
            user_name_snapshot: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            user_role_snapshot: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            device_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            device_name_snapshot: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            device_serial_snapshot: {
                type: DataTypes.STRING(100),
                allowNull: false,
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
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            detected_color_hex: {
                type: DataTypes.STRING(7),
                allowNull: false,
            },
            detected_color_hex_yellow: {
                type: DataTypes.STRING(7),
                allowNull: true,
            },
            detected_color_hex_blue: {
                type: DataTypes.STRING(7),
                allowNull: true,
            },
            detected_color_label: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            accepted_min_value: {
                type: DataTypes.DECIMAL(10, 4),
                allowNull: false,
            },
            accepted_max_value: {
                type: DataTypes.DECIMAL(10, 4),
                allowNull: false,
            },
            result_status: {
                type: DataTypes.ENUM('Within Range', 'Below Range', 'Above Range', 'Invalid Reading'),
                allowNull: false,
            },
            notes_from_mobile: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            retest_of_result_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            sync_status: {
                type: DataTypes.ENUM('Synced', 'Pending Sync', 'Sync Failed'),
                allowNull: false,
                defaultValue: 'Synced',
            },
            tested_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            synced_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: 'test_results',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return TestResult;
};