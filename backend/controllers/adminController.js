const { User, Score, Payment, CharityDonation, Draw, Winner, Charity } = require('../models');
const { Op, fn, col } = require('sequelize');

// @desc    Get analytics/overview
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      totalRevenue,
      totalCharityContributions,
      publishedDraws,
      pendingWinners,
    ] = await Promise.all([
      User.count({ where: { role: 'subscriber' } }),
      User.count({ where: { subscriptionStatus: 'active' } }),
      Payment.sum('amount', { where: { status: 'succeeded' } }),
      CharityDonation.sum('amount', { where: { status: 'completed' } }),
      Draw.count({ where: { status: 'published' } }),
      Winner.count({ where: { paymentStatus: 'verification_required' } }),
    ]);

    const latestDraw = await Draw.findOne({
      where: { status: 'published' },
      order: [['year', 'DESC'], ['month', 'DESC']],
    });

    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'firstName', 'lastName', 'email', 'subscriptionStatus', 'createdAt'],
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeSubscribers,
        totalRevenue: totalRevenue || 0,
        totalCharityContributions: totalCharityContributions || 0,
        publishedDraws,
        pendingWinners,
        currentPrizePool: latestDraw ? latestDraw.totalPool : 0,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const where = { role: 'subscriber' };

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.subscriptionStatus = status;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [{ model: Charity, as: 'selectedCharity', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] },
    });

    res.status(200).json({
      success: true,
      users,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Score, as: 'scores', order: [['playedAt', 'DESC']] },
        { model: Charity, as: 'selectedCharity', attributes: ['id', 'name'] },
        { model: Payment, as: 'payments', limit: 10, order: [['createdAt', 'DESC']] },
        { model: Winner, as: 'winnings', include: [{ model: Draw, as: 'draw', attributes: ['id', 'name', 'month', 'year'] }] },
      ],
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const allowed = ['firstName', 'lastName', 'phone', 'country', 'subscriptionStatus', 'subscriptionPlan', 'selectedCharityId', 'charityContributionPercent', 'handicap'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get draw statistics
// @route   GET /api/admin/draw-stats
exports.getDrawStats = async (req, res) => {
  try {
    const draws = await Draw.findAll({
      where: { status: 'published' },
      include: [{ model: Winner, as: 'winners' }],
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: 12,
    });

    const stats = draws.map((d) => ({
      id: d.id,
      name: d.name,
      month: d.month,
      year: d.year,
      totalPool: d.totalPool,
      participants: d.totalParticipants,
      winners: d.winners.length,
      jackpotWon: !d.jackpotRolledOver,
    }));

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
