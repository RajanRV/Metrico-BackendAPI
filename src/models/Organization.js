module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    'Organization',
    {
      organization_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      organization_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
        allowNull: false,
      },
    },
    {
      tableName: 'organizations',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Organization.associate = (models) => {
    Organization.hasMany(models.Facility, { foreignKey: 'organization_id' });
    Organization.hasMany(models.User, { foreignKey: 'organization_id' });
    Organization.hasMany(models.Device, { foreignKey: 'organization_id' });
    Organization.hasMany(models.TestResult, { foreignKey: 'organization_id' });
  };

  return Organization;
};