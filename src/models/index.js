'use strict';

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

const Organization = require('./Organization')(sequelize, Sequelize.DataTypes)
const Facility = require('./Facility')(sequelize, Sequelize.DataTypes)
const Device = require('./Device')(sequelize, Sequelize.DataTypes)
const User = require('./User')(sequelize, Sequelize.DataTypes)
const AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes)
const TestResult = require('./TestResult')(sequelize, Sequelize.DataTypes)

const models = { Organization, Facility, Device, User, AuditLog, TestResult }
Object.values(models).forEach(m => m.associate?.(models))

module.exports = { sequelize, Sequelize, ...models }