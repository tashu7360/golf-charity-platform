import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Pricing.css';

const features = [
  'Monthly draw entry with your 5 Stableford scores',
  'Choose & support your preferred charity',
  'Full score history & performance tracking',
  'Access to all past draw results',
  'Winner verification & prize payout system',
  'Cancel anytime',
];

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Pricing = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) { navigate('/register'); return; }
    if (user.subscriptionStatus === 'active') { navigate('/dashboard'); return; }
    setLoading(true);
    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        toast.error('Could not load payment gateway. Check your internet.');
        setLoading(false);
        return;
      }
      const { data } = await API.post('/subscriptions/checkout', { plan: billing });
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'GolfGives',
        description: billing === 'yearly' ? 'Yearly Subscription' : 'Monthly Subscription',
        order_id: data.order.id,
        prefill: { name: data.user.name, email: data.user.email, contact: data.user.contact },
        theme: { color: '#3ddc84' },
        handler: async (response) => {
          try {
            await API.post('/subscriptions/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: billing,
            });
            await refreshUser();
            toast.success('Subscription activated! Welcome to GolfGives 🎉');
            navigate('/dashboard?subscription=success');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => { toast('Payment cancelled.', { icon: 'ℹ️' }); setLoading(false); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment.');
      setLoading(false);
    }
  };

  return (
    <div className="page pricing-page">
      <div className="container">
        <div className="pricing-header">
          <h1 className="page-title text-center">Simple, transparent pricing</h1>
          <p className="page-subtitle text-center">One plan. Everything included. No hidden fees.</p>
          <div className="billing-toggle">
            <button className={`toggle-btn${billing === 'monthly' ? ' active' : ''}`} onClick={() => setBilling('monthly')}>Monthly</button>
            <button className={`toggle-btn${billing === 'yearly' ? ' active' : ''}`} onClick={() => setBilling('yearly')}>
              Yearly <span className="save-badge">Save 17%</span>
            </button>
          </div>
        </div>
        <div className="pricing-card-wrap">
          <div className="pricing-card">
            <div className="pricing-plan-label">Full Access</div>
            <div className="pricing-amount">
              <span className="currency">₹</span>
              <span className="price">{billing === 'monthly' ? '999' : '9,999'}</span>
              <span className="period">/{billing === 'monthly' ? 'month' : 'year'}</span>
            </div>
            {billing === 'yearly' && <p className="per-month-note">Just ₹833/month, billed annually</p>}
            <ul className="feature-list">
              {features.map((f, i) => <li key={i}><span className="check">✓</span> {f}</li>)}
            </ul>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleSubscribe} disabled={loading}>
              {loading ? 'Opening payment…' : user?.subscriptionStatus === 'active' ? 'Already subscribed ✓' : 'Subscribe now →'}
            </button>
            <p className="stripe-note">🔒 Secure payment powered by Razorpay</p>
          </div>
          <div className="pricing-breakdown">
            <h3>Where your money goes</h3>
            <div className="breakdown-items">
              <div className="breakdown-item"><span className="breakdown-dot green" /><span className="breakdown-label">Prize Pool</span><span className="breakdown-pct">60%</span></div>
              <div className="breakdown-item"><span className="breakdown-dot gold" /><span className="breakdown-label">Your Charity (min)</span><span className="breakdown-pct">10%</span></div>
              <div className="breakdown-item"><span className="breakdown-dot grey" /><span className="breakdown-label">Platform & Operations</span><span className="breakdown-pct">30%</span></div>
            </div>
            <p className="breakdown-note">You can increase your charity contribution anytime from your dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;