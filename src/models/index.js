const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    ...(dbConfig.dialectOptions && { dialectOptions: dbConfig.dialectOptions }),
  }
);

const User       = require('./User')(sequelize, Sequelize.DataTypes);
const AuditLog   = require('./AuditLog')(sequelize, Sequelize.DataTypes);
const TestResult = require('./TestResult')(sequelize, Sequelize.DataTypes);

User.hasMany(AuditLog,    { foreignKey: 'user_id' });
AuditLog.belongsTo(User,  { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  AuditLog,
  TestResult,
};