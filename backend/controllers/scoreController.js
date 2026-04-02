const { Score, User } = require('../models');
const { Op } = require('sequelize');

const MAX_SCORES = 5;

// @desc    Get user's scores
// @route   GET /api/scores
exports.getScores = async (req, res) => {
  try {
    const scores = await Score.findAll({
      where: { userId: req.user.id },
      order: [['playedAt', 'DESC']],
      limit: MAX_SCORES,
    });
    res.status(200).json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a score (rolling 5-score logic)
// @route   POST /api/scores
exports.addScore = async (req, res) => {
  try {
    const { score, playedAt, courseName, notes } = req.body;

    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45 (Stableford format)' });
    }

    if (!playedAt) {
      return res.status(400).json({ success: false, message: 'Please provide the date played' });
    }

    // Count existing scores
    const count = await Score.count({ where: { userId: req.user.id } });

    if (count >= MAX_SCORES) {
      // Delete the oldest score
      const oldest = await Score.findOne({
        where: { userId: req.user.id },
        order: [['playedAt', 'ASC']],
      });
      if (oldest) await oldest.destroy();
    }

    const newScore = await Score.create({
      userId: req.user.id,
      score,
      playedAt,
      courseName,
      notes,
    });

    const allScores = await Score.findAll({
      where: { userId: req.user.id },
      order: [['playedAt', 'DESC']],
    });

    res.status(201).json({ success: true, score: newScore, scores: allScores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a score
// @route   PUT /api/scores/:id
exports.updateScore = async (req, res) => {
  try {
    const scoreRecord = await Score.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!scoreRecord) {
      return res.status(404).json({ success: false, message: 'Score not found' });
    }

    const { score, playedAt, courseName, notes } = req.body;

    if (score && (score < 1 || score > 45)) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
    }

    if (score) scoreRecord.score = score;
    if (playedAt) scoreRecord.playedAt = playedAt;
    if (courseName !== undefined) scoreRecord.courseName = courseName;
    if (notes !== undefined) scoreRecord.notes = notes;

    await scoreRecord.save();
    res.status(200).json({ success: true, score: scoreRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a score
// @route   DELETE /api/scores/:id
exports.deleteScore = async (req, res) => {
  try {
    const scoreRecord = await Score.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!scoreRecord) {
      return res.status(404).json({ success: false, message: 'Score not found' });
    }

    await scoreRecord.destroy();
    res.status(200).json({ success: true, message: 'Score deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get scores for a user
// @route   GET /api/admin/scores/:userId
exports.adminGetUserScores = async (req, res) => {
  try {
    const scores = await Score.findAll({
      where: { userId: req.params.userId },
      order: [['playedAt', 'DESC']],
    });
    res.status(200).json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Edit a score
// @route   PUT /api/admin/scores/:id
exports.adminUpdateScore = async (req, res) => {
  try {
    const scoreRecord = await Score.findByPk(req.params.id);
    if (!scoreRecord) {
      return res.status(404).json({ success: false, message: 'Score not found' });
    }
    const { score, playedAt, courseName, notes } = req.body;
    if (score) scoreRecord.score = score;
    if (playedAt) scoreRecord.playedAt = playedAt;
    if (courseName !== undefined) scoreRecord.courseName = courseName;
    if (notes !== undefined) scoreRecord.notes = notes;
    await scoreRecord.save();
    res.status(200).json({ success: true, score: scoreRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
