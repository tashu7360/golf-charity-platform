const sequelize = require('../config/database');
const User = require('./User');
const Score = require('./Score');
const Charity = require('./Charity');
const Draw = require('./Draw');
const { DrawEntry, Winner } = require('./DrawEntry');
const { Payment, CharityDonation } = require('./Payment');

// User associations
User.hasMany(Score, { foreignKey: 'userId', as: 'scores', onDelete: 'CASCADE' });
Score.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.belongsTo(Charity, { foreignKey: 'selectedCharityId', as: 'selectedCharity' });
Charity.hasMany(User, { foreignKey: 'selectedCharityId', as: 'subscribers' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DrawEntry, { foreignKey: 'userId', as: 'drawEntries' });
DrawEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Winner, { foreignKey: 'userId', as: 'winnings' });
Winner.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(CharityDonation, { foreignKey: 'userId', as: 'donations' });
CharityDonation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Draw associations
Draw.hasMany(DrawEntry, { foreignKey: 'drawId', as: 'entries' });
DrawEntry.belongsTo(Draw, { foreignKey: 'drawId', as: 'draw' });

Draw.hasMany(Winner, { foreignKey: 'drawId', as: 'winners' });
Winner.belongsTo(Draw, { foreignKey: 'drawId', as: 'draw' });

// Charity associations
Charity.hasMany(CharityDonation, { foreignKey: 'charityId', as: 'donations' });
CharityDonation.belongsTo(Charity, { foreignKey: 'charityId', as: 'charity' });

module.exports = {
  sequelize,
  User,
  Score,
  Charity,
  Draw,
  DrawEntry,
  Winner,
  Payment,
  CharityDonation,
};
