module.exports = (sequelize, DataTypes) => {
    const Facility = sequelize.define(
        'Facility',
        {
            facility_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            organization_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            facility_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            timezone: {
                type: DataTypes.STRING(100),
                defaultValue: 'UTC',
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('Active', 'Inactive'),
                defaultValue: 'Active',
                allowNull: false,
            },
        },
        {
            tableName: 'facilities',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    Facility.associate = (models) => {
        Facility.belongsTo(models.Organization, { foreignKey: 'organization_id' });
        Facility.hasMany(models.User, { foreignKey: 'facility_id' });
        Facility.hasMany(models.Device, { foreignKey: 'facility_id' });
        Facility.hasMany(models.TestResult, { foreignKey: 'facility_id' });
    };

    return Facility;
};