module.exports = (sequelize, DataTypes) => {
    const Device = sequelize.define(
        'Device',
        {
            device_id: {
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
            device_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            serial_number: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            // Sub-location within facility e.g. "Line 1", "Pack", "Cold Room"
            location_label: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            connection_status: {
                type: DataTypes.ENUM('Connected', 'Offline', 'Not Detected', 'Maintenance'),
                defaultValue: 'Not Detected',
                allowNull: false,
            },
            power_status: {
                type: DataTypes.ENUM('DC Power Connected', 'Device Offline', 'Device Not Detected'),
                allowNull: true,
            },
            firmware_version: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            last_connected_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            last_sync_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('Active', 'Inactive', 'Deactivated'),
                defaultValue: 'Active',
                allowNull: false,
            },
        },
        {
            tableName: 'devices',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    Device.associate = (models) => {
        Device.belongsTo(models.Organization, { foreignKey: 'organization_id' });
        Device.belongsTo(models.Facility, { foreignKey: 'facility_id' });
        Device.hasMany(models.TestResult, { foreignKey: 'device_id' });
    };

    Device.prototype.isSyncStale = function (hours = 4) {
        if (!this.last_sync_at) return true;
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.last_sync_at < cutoff;
    };

    return Device;
};