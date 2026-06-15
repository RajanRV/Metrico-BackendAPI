const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      user_id: {
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
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('Admin', 'Supervisor', 'Testing Staff'),
        allowNull: false,
      },
      web_access_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Invited'),
        defaultValue: 'Active',
        allowNull: false,
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      hooks: {
        beforeSave: (user) => {
          if (user.role === 'Testing Staff') {
            user.web_access_enabled = false;
          }
        },
      },
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Organization, { foreignKey: 'organization_id' });
    User.belongsTo(models.Facility, { foreignKey: 'facility_id' });
  };

  User.prototype.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password_hash);
  };

  User.prototype.getFullName = function () {
    return `${this.first_name} ${this.last_name}`;
  };

  User.hashPassword = async (plainPassword) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(plainPassword, salt);
  };

  return User;
};