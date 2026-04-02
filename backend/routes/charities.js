const express = require('express');
const router = express.Router();
const {
  getCharities,
  getCharity,
  donate,
} = require('../controllers/charityController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getCharities);
router.get('/:id', getCharity);

// Protected routes
router.post('/:id/donate', protect, donate);

module.exports = router;
