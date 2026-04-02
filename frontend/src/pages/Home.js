import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const stats = [
  { number: '£124,500', label: 'Donated to charities' },
  { number: '2,840', label: 'Active members' },
  { number: '36', label: 'Monthly draws run' },
  { number: '£68,200', label: 'Prizes paid out' },
];

const steps = [
  { icon: '🎯', title: 'Subscribe', body: 'Join monthly or yearly. A portion of every subscription funds the prize pool and goes to your chosen charity.' },
  { icon: '⛳', title: 'Enter your scores', body: 'Log your latest 5 Stableford scores. The system keeps a rolling record — always your freshest five.' },
  { icon: '🎲', title: 'Enter the draw', body: 'Each month, 5 numbers are drawn. Match 3, 4, or all 5 of your scores to win a share of the prize pool.' },
  { icon: '💚', title: 'Give back', body: 'Win or not, a portion of your subscription goes directly to a charity you believe in.' },
];

const Home = () => {
  const { user } = useAuth();
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const { clientX, clientY } = e;
      const { width, height } = el.getBoundingClientRect();
      const x = (clientX / width - 0.5) * 20;
      const y = (clientY / height - 0.5) * 20;
      el.style.setProperty('--gx', `${50 + x}%`);
      el.style.setProperty('--gy', `${50 + y}%`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-glow" />
        <div className="container hero-content">
          <div className="hero-badge">🌍 Golf with purpose</div>
          <h1 className="hero-title">
            Play golf.<br />
            <span className="hero-accent">Change lives.</span><br />
            Win prizes.
          </h1>
          <p className="hero-subtitle">
            The subscription platform where your golf scores enter you into monthly draws — while automatically supporting the charities that need it most.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/pricing" className="btn btn-primary btn-lg">Start for £9.99/mo →</Link>
                <Link to="/how-it-works" className="btn btn-secondary btn-lg">How it works</Link>
              </>
            )}
          </div>
          <p className="hero-note">No golf clichés. No fairway wallpaper. Just impact.</p>
        </div>
        <div className="hero-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <div className="section-tag">How it works</div>
          <h2 className="section-heading">Simple by design.<br />Powerful by impact.</h2>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-icon">{step.icon}</div>
                <div className="step-num">0{i + 1}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize pool */}
      <section className="prize-section">
        <div className="container">
          <div className="prize-inner">
            <div className="prize-text">
              <div className="section-tag">Prize structure</div>
              <h2 className="section-heading">Real money. Real winners.</h2>
              <p className="prize-desc">Every subscription contributes to a growing monthly prize pool, split across three tiers. Match all 5 and claim the jackpot — or it rolls over to next month.</p>
            </div>
            <div className="prize-tiers">
              <div className="tier tier-gold">
                <div className="tier-icon">🏆</div>
                <div className="tier-label">5-Number Match</div>
                <div className="tier-pct">40%</div>
                <div className="tier-note">Jackpot — rolls over if unclaimed</div>
              </div>
              <div className="tier">
                <div className="tier-icon">🥈</div>
                <div className="tier-label">4-Number Match</div>
                <div className="tier-pct">35%</div>
                <div className="tier-note">Split equally among winners</div>
              </div>
              <div className="tier">
                <div className="tier-icon">🥉</div>
                <div className="tier-label">3-Number Match</div>
                <div className="tier-pct">25%</div>
                <div className="tier-note">Split equally among winners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity CTA */}
      <section className="charity-cta">
        <div className="container">
          <div className="charity-cta-inner">
            <h2>Every round you play <span className="text-green">funds what matters.</span></h2>
            <p>Choose your charity at signup. A minimum of 10% of your subscription goes directly to them — and you can give more whenever you want.</p>
            <Link to="/charities" className="btn btn-primary btn-lg">Explore charities →</Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!user && (
        <section className="final-cta">
          <div className="container">
            <h2 className="final-cta-title">Ready to play with purpose?</h2>
            <p className="final-cta-sub">Join thousands of golfers making every round count.</p>
            <Link to="/pricing" className="btn btn-primary btn-lg">Subscribe today →</Link>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="logo-icon">⛳</span>
              <span className="logo-text">Golf<span className="logo-accent">Gives</span></span>
            </div>
            <div className="footer-links">
              <Link to="/charities">Charities</Link>
              <Link to="/draws">Draws</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/how-it-works">How it works</Link>
            </div>
            <p className="footer-copy">© 2026 GolfGives. Built with purpose.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
