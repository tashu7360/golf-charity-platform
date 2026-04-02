const { Charity, CharityDonation, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all charities
// @route   GET /api/charities
exports.getCharities = async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;

    const charities = await Charity.findAll({ where, order: [['isFeatured', 'DESC'], ['name', 'ASC']] });
    res.status(200).json({ success: true, charities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single charity
// @route   GET /api/charities/:id
exports.getCharity = async (req, res) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.status(200).json({ success: true, charity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create charity
// @route   POST /api/admin/charities
exports.createCharity = async (req, res) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ success: true, charity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update charity
// @route   PUT /api/admin/charities/:id
exports.updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    await charity.update(req.body);
    res.status(200).json({ success: true, charity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Delete charity
// @route   DELETE /api/admin/charities/:id
exports.deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    await charity.destroy();
    res.status(200).json({ success: true, message: 'Charity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Make an independent donation
// @route   POST /api/charities/:id/donate
exports.donate = async (req, res) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }

    const donation = await CharityDonation.create({
      userId: req.user.id,
      charityId: charity.id,
      amount,
      type: 'independent',
      status: 'completed',
    });

    await charity.increment('totalReceived', { by: amount });
    res.status(201).json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
