const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifyPayment,
  cancelSubscription,
  getSubscriptionStatus,
  getPaymentHistory,
  stripeWebhook,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Stripe webhook — raw body required, no auth
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.use(protect);
router.post('/checkout', createCheckoutSession);
router.post('/verify', verifyPayment);
router.post('/cancel', cancelSubscription);
router.get('/status', getSubscriptionStatus);
router.get('/payments', getPaymentHistory);

module.exports = router;
