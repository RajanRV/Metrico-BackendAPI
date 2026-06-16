module.exports = (sequelize, DataTypes) => {
    const AuditLog = sequelize.define(
        'AuditLog',
        {
            audit_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            organization_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            facility_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            user_name_snapshot: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            action_type: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            record_type: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            record_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            details_json: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            ip_address: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
        },
        {
            tableName: 'audit_logs',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
        }
    );

    AuditLog.associate = (models) => {
        AuditLog.belongsTo(models.Organization, { foreignKey: 'organization_id', constraints: false });
        AuditLog.belongsTo(models.Facility, { foreignKey: 'facility_id', constraints: false });
        AuditLog.belongsTo(models.User, { foreignKey: 'user_id', constraints: false });
    };

    return AuditLog;
};