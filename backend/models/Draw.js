const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Draw = sequelize.define('Draw', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 12 },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  drawType: {
    type: DataTypes.ENUM('random', 'algorithmic'),
    defaultValue: 'random',
  },
  status: {
    type: DataTypes.ENUM('pending', 'simulated', 'published'),
    defaultValue: 'pending',
  },
  drawnNumbers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of 5 numbers drawn (1-45)',
  },
  totalPool: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  jackpotPool: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '40% of pool + any rolled over jackpot',
  },
  fourMatchPool: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '35% of pool',
  },
  threeMatchPool: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '25% of pool',
  },
  jackpotRolledOver: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rolledOverAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  simulationData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

module.exports = Draw;
