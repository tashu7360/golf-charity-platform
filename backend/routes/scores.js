const express = require('express');
const router = express.Router();
const {
  getScores,
  addScore,
  updateScore,
  deleteScore,
} = require('../controllers/scoreController');
const { protect, requireActiveSubscription } = require('../middleware/auth');

router.use(protect);

router.get('/', requireActiveSubscription, getScores);
router.post('/', requireActiveSubscription, addScore);
router.put('/:id', requireActiveSubscription, updateScore);
router.delete('/:id', requireActiveSubscription, deleteScore);

module.exports = router;
