const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('subscriber', 'admin'),
    defaultValue: 'subscriber',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'IN',
  },
  handicap: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true,
  },
  selectedCharityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  charityContributionPercent: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 10, max: 100 },
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'lapsed'),
    defaultValue: 'inactive',
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('monthly', 'yearly'),
    allowNull: true,
  },
  subscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subscriptionStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subscriptionEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalWinnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.resetPasswordToken;
  delete values.resetPasswordExpire;
  return values;
};

module.exports = User;
