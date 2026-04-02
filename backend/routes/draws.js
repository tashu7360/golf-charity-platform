const express = require('express');
const router = express.Router();
const {
  getDraws,
  getDraw,
  getMyEntries,
} = require('../controllers/drawController');
const { protect, requireActiveSubscription } = require('../middleware/auth');

router.get('/', protect, getDraws);
router.get('/my-entries', protect, requireActiveSubscription, getMyEntries);
router.get('/:id', protect, getDraw);

module.exports = router;
