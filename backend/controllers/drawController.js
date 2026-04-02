const { Draw, DrawEntry, Winner, User, Score, Payment } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');

// ---- Draw Engine ----
const generateRandomNumbers = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const generateAlgorithmicNumbers = async () => {
  // Weight by frequency of user scores
  const scoreCounts = await Score.findAll({
    attributes: ['score', [fn('COUNT', col('score')), 'count']],
    group: ['score'],
    order: [[literal('count'), 'DESC']],
    raw: true,
  });

  if (scoreCounts.length < 5) return generateRandomNumbers();

  // Pick 3 most frequent + 2 least frequent scores
  const mostFrequent = scoreCounts.slice(0, 3).map((s) => s.score);
  const leastFrequent = scoreCounts.slice(-2).map((s) => s.score);
  const combined = [...new Set([...mostFrequent, ...leastFrequent])];

  while (combined.length < 5) {
    const rand = Math.floor(Math.random() * 45) + 1;
    if (!combined.includes(rand)) combined.push(rand);
  }

  return combined.slice(0, 5).sort((a, b) => a - b);
};

const checkMatch = (userScores, drawnNumbers) => {
  const scoreValues = userScores.map((s) => s.score || s);
  const matched = scoreValues.filter((s) => drawnNumbers.includes(s));
  return { count: matched.length, matched };
};

// @desc    Get all draws
// @route   GET /api/draws
exports.getDraws = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'admin') where.status = 'published';

    const draws = await Draw.findAll({
      where,
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: 12,
    });
    res.status(200).json({ success: true, draws });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single draw
// @route   GET /api/draws/:id
exports.getDraw = async (req, res) => {
  try {
    const draw = await Draw.findByPk(req.params.id, {
      include: [{ model: Winner, as: 'winners', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }] }],
    });
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });

    let myEntry = null;
    if (req.user) {
      myEntry = await DrawEntry.findOne({ where: { drawId: draw.id, userId: req.user.id } });
    }

    res.status(200).json({ success: true, draw, myEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create draw
// @route   POST /api/admin/draws
exports.createDraw = async (req, res) => {
  try {
    const { name, month, year, drawType } = req.body;

    const existing = await Draw.findOne({ where: { month, year } });
    if (existing) return res.status(400).json({ success: false, message: 'Draw for this month already exists' });

    // Calculate prize pool from active subscriptions
    const activeUsers = await User.count({ where: { subscriptionStatus: 'active' } });
    const monthlyRate = 9.99; // £9.99/month base
    const totalPool = parseFloat((activeUsers * monthlyRate * 0.6).toFixed(2)); // 60% goes to prize pool

    // Check for rolled over jackpot from last month
    const lastDraw = await Draw.findOne({
      where: { status: 'published', jackpotRolledOver: true },
      order: [['year', 'DESC'], ['month', 'DESC']],
    });
    const rolledOver = lastDraw ? parseFloat(lastDraw.jackpotPool) : 0;

    const draw = await Draw.create({
      name: name || `Draw – ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
      month,
      year,
      drawType: drawType || 'random',
      totalPool,
      jackpotPool: parseFloat((totalPool * 0.4 + rolledOver).toFixed(2)),
      fourMatchPool: parseFloat((totalPool * 0.35).toFixed(2)),
      threeMatchPool: parseFloat((totalPool * 0.25).toFixed(2)),
      rolledOverAmount: rolledOver,
      totalParticipants: activeUsers,
    });

    res.status(201).json({ success: true, draw });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Run simulation
// @route   POST /api/admin/draws/:id/simulate
exports.simulateDraw = async (req, res) => {
  try {
    const draw = await Draw.findByPk(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status === 'published') return res.status(400).json({ success: false, message: 'Draw already published' });

    const drawnNumbers = draw.drawType === 'algorithmic'
      ? await generateAlgorithmicNumbers()
      : generateRandomNumbers();

    // Simulate entries for all active users
    const activeUsers = await User.findAll({
      where: { subscriptionStatus: 'active' },
      include: [{ model: Score, as: 'scores', limit: 5, order: [['playedAt', 'DESC']] }],
    });

    let fiveMatch = 0, fourMatch = 0, threeMatch = 0;
    const simulationResults = activeUsers.map((user) => {
      const scores = user.scores || [];
      const { count, matched } = checkMatch(scores, drawnNumbers);
      if (count === 5) fiveMatch++;
      else if (count === 4) fourMatch++;
      else if (count === 3) threeMatch++;
      return { userId: user.id, name: `${user.firstName} ${user.lastName}`, scores: scores.map(s => s.score), matched, count };
    });

    draw.simulationData = { drawnNumbers, simulationResults, fiveMatch, fourMatch, threeMatch };
    draw.status = 'simulated';
    await draw.save();

    res.status(200).json({ success: true, draw, simulation: draw.simulationData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Publish draw
// @route   POST /api/admin/draws/:id/publish
exports.publishDraw = async (req, res) => {
  try {
    const draw = await Draw.findByPk(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status === 'published') return res.status(400).json({ success: false, message: 'Draw already published' });

    const drawnNumbers = draw.drawType === 'algorithmic'
      ? await generateAlgorithmicNumbers()
      : generateRandomNumbers();

    const activeUsers = await User.findAll({
      where: { subscriptionStatus: 'active' },
      include: [{ model: Score, as: 'scores', limit: 5, order: [['playedAt', 'DESC']] }],
    });

    const t = await sequelize.transaction();
    try {
      const entries = [];
      const winners = [];
      let fiveMatchers = [], fourMatchers = [], threeMatchers = [];

      for (const user of activeUsers) {
        const scores = user.scores || [];
        const { count, matched } = checkMatch(scores, drawnNumbers);
        const matchType = count >= 5 ? '5-match' : count === 4 ? '4-match' : count === 3 ? '3-match' : 'none';

        const entry = await DrawEntry.create({
          drawId: draw.id, userId: user.id,
          scores: scores.map(s => ({ score: s.score, playedAt: s.playedAt })),
          matchType, matchedNumbers: matched,
        }, { transaction: t });
        entries.push(entry);

        if (count >= 5) fiveMatchers.push(user);
        else if (count === 4) fourMatchers.push(user);
        else if (count === 3) threeMatchers.push(user);
      }

      // Create winners & calculate prizes
      const createWinners = async (matchers, matchType, pool) => {
        if (matchers.length === 0) return;
        const prize = parseFloat((pool / matchers.length).toFixed(2));
        for (const user of matchers) {
          const winner = await Winner.create({
            drawId: draw.id, userId: user.id, matchType,
            prizeAmount: prize,
            paymentStatus: matchType === '5-match' ? 'verification_required' : 'pending',
          }, { transaction: t });
          winners.push(winner);
          await user.increment('totalWinnings', { by: prize, transaction: t });
        }
      };

      await createWinners(fiveMatchers, '5-match', draw.jackpotPool);
      await createWinners(fourMatchers, '4-match', draw.fourMatchPool);
      await createWinners(threeMatchers, '3-match', draw.threeMatchPool);

      draw.drawnNumbers = drawnNumbers;
      draw.status = 'published';
      draw.publishedAt = new Date();
      draw.jackpotRolledOver = fiveMatchers.length === 0;
      await draw.save({ transaction: t });

      await t.commit();
      res.status(200).json({ success: true, draw, winners: winners.length, drawnNumbers });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my draw entries
// @route   GET /api/draws/my-entries
exports.getMyEntries = async (req, res) => {
  try {
    const entries = await DrawEntry.findAll({
      where: { userId: req.user.id },
      include: [{ model: Draw, as: 'draw', attributes: ['id', 'name', 'month', 'year', 'status', 'drawnNumbers'] }],
      order: [[{ model: Draw, as: 'draw' }, 'year', 'DESC'], [{ model: Draw, as: 'draw' }, 'month', 'DESC']],
    });
    res.status(200).json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
