const Razorpay = require('razorpay');
const crypto = require('crypto');
const { User, Payment, CharityDonation, Charity } = require('../models');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  monthly: { amount: 99900, currency: 'INR', gbpEquiv: 9.99 },
  yearly:  { amount: 999900, currency: 'INR', gbpEquiv: 99.99 },
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan.' });
    const planDetails = PLANS[plan];
    const order = await razorpay.orders.create({
      amount: planDetails.amount,
      currency: planDetails.currency,
      receipt: `rcpt_${user.id}_${Date.now()}`,
      notes: { userId: user.id, plan, userEmail: user.email },
    });
    res.status(200).json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency, plan },
      key: process.env.RAZORPAY_KEY_ID,
      user: { name: `${user.firstName} ${user.lastName}`, email: user.email, contact: user.phone || '' },
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }
    const user = await User.findByPk(req.user.id);
    const planDetails = PLANS[plan];
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);
    user.subscriptionStatus = 'active';
    user.subscriptionPlan = plan;
    user.subscriptionStart = now;
    user.subscriptionEnd = periodEnd;
    await user.save();
    const amount = planDetails.gbpEquiv;
    const charityAmount = parseFloat((amount * (user.charityContributionPercent / 100)).toFixed(2));
    await Payment.create({
      userId: user.id,
      stripePaymentIntentId: razorpay_payment_id,
      stripeSubscriptionId: razorpay_order_id,
      amount, currency: 'inr', plan, status: 'succeeded',
      charityContribution: charityAmount,
      prizePoolContribution: parseFloat((amount * 0.6).toFixed(2)),
      periodStart: now, periodEnd,
    });
    if (user.selectedCharityId) {
      await CharityDonation.create({
        userId: user.id, charityId: user.selectedCharityId,
        amount: charityAmount, type: 'subscription', status: 'completed',
      });
      await Charity.increment('totalReceived', { by: charityAmount, where: { id: user.selectedCharityId } });
    }
    res.status(200).json({ success: true, message: 'Payment verified. Subscription activated!' });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user.subscriptionStatus !== 'active') return res.status(400).json({ success: false, message: 'No active subscription.' });
    user.subscriptionStatus = 'cancelled';
    await user.save();
    res.status(200).json({ success: true, message: 'Subscription cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({ success: true, status: user.subscriptionStatus, plan: user.subscriptionPlan, renewalDate: user.subscriptionEnd });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit: 24 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// kept as stripeWebhook for route compatibility
exports.stripeWebhook = async (req, res) => {
  res.status(200).json({ received: true });
};