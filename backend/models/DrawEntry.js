const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DrawEntry = sequelize.define('DrawEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  drawId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  scores: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Snapshot of user top-5 scores at draw time',
  },
  matchType: {
    type: DataTypes.ENUM('none', '3-match', '4-match', '5-match'),
    defaultValue: 'none',
  },
  matchedNumbers: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  prizeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
});

const Winner = sequelize.define('Winner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  drawId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  matchType: {
    type: DataTypes.ENUM('3-match', '4-match', '5-match'),
    allowNull: false,
  },
  prizeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'verification_required', 'verified', 'paid', 'rejected'),
    defaultValue: 'pending',
  },
  proofImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = { DrawEntry, Winner };
