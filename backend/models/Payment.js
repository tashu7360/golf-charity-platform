const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'gbp',
  },
  plan: {
    type: DataTypes.ENUM('monthly', 'yearly'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  charityContribution: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  prizePoolContribution: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

const CharityDonation = sequelize.define('CharityDonation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  charityId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('subscription', 'independent'),
    defaultValue: 'subscription',
  },
  paymentId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
});

module.exports = { Payment, CharityDonation };
