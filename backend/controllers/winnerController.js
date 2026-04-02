const { Winner, Draw, User } = require('../models');
const path = require('path');
const fs = require('fs');

// @desc    Get my winnings
// @route   GET /api/winners/my
exports.getMyWinnings = async (req, res) => {
  try {
    const winnings = await Winner.findAll({
      where: { userId: req.user.id },
      include: [{ model: Draw, as: 'draw', attributes: ['id', 'name', 'month', 'year', 'drawnNumbers'] }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, winnings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload proof for winning
// @route   POST /api/winners/:id/proof
exports.uploadProof = async (req, res) => {
  try {
    const winner = await Winner.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!winner) return res.status(404).json({ success: false, message: 'Winning record not found' });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a proof image' });
    }

    winner.proofImageUrl = `/uploads/${req.file.filename}`;
    winner.submittedAt = new Date();
    winner.paymentStatus = 'verification_required';
    await winner.save();

    res.status(200).json({ success: true, winner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all winners
// @route   GET /api/admin/winners
exports.adminGetWinners = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.paymentStatus = status;

    const winners = await Winner.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Draw, as: 'draw', attributes: ['id', 'name', 'month', 'year'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, winners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Verify winner
// @route   PUT /api/admin/winners/:id/verify
exports.adminVerifyWinner = async (req, res) => {
  try {
    const { action, adminNotes } = req.body; // 'approve' or 'reject'
    const winner = await Winner.findByPk(req.params.id);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    if (action === 'approve') {
      winner.paymentStatus = 'verified';
      winner.verifiedAt = new Date();
    } else if (action === 'reject') {
      winner.paymentStatus = 'rejected';
    }

    if (adminNotes) winner.adminNotes = adminNotes;
    await winner.save();
    res.status(200).json({ success: true, winner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Mark as paid
// @route   PUT /api/admin/winners/:id/pay
exports.adminMarkPaid = async (req, res) => {
  try {
    const winner = await Winner.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    winner.paymentStatus = 'paid';
    winner.paidAt = new Date();
    await winner.save();

    res.status(200).json({ success: true, winner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
