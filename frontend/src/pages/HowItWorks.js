import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => (
  <div className="page" style={{paddingTop:100}}>
    <div className="container" style={{maxWidth:780}}>
      <h1 className="page-title">How it works</h1>
      <p className="page-subtitle">Everything you need to know about GolfGives — from subscription to prize payout.</p>

      {[
        { emoji:'🎯', title:'Step 1 — Subscribe', body:'Choose a monthly (£9.99) or yearly (£99.99) plan. 60% of every subscription contributes to the monthly prize pool. A minimum 10% goes directly to the charity you choose.' },
        { emoji:'⛳', title:'Step 2 — Log your scores', body:'Enter your Stableford scores from each round you play. Valid scores are between 1 and 45. The platform stores your latest 5 — when you add a new one, the oldest is replaced automatically.' },
        { emoji:'🎲', title:'Step 3 — The monthly draw', body:'Once per month, 5 numbers are drawn from 1–45. The draw can be random or algorithmically weighted by the most and least frequent scores across all users. Your 5 most recent scores are your "entry".' },
        { emoji:'🏆', title:'Step 4 — Win prizes', body:'Match 3, 4, or all 5 of your scores to the drawn numbers to win. Prize pools are split: 40% jackpot (rolls over if unclaimed), 35% for 4-matches, and 25% for 3-matches. Multiple winners in a tier share equally.' },
        { emoji:'✅', title:'Step 5 — Verification', body:'If you win the jackpot (5-match), you\'ll be asked to upload a screenshot of your scores from the platform as proof. The admin team reviews and approves or rejects submissions. Once verified, payment is processed.' },
        { emoji:'💚', title:'Your charitable impact', body:'Every month, your subscription automatically sends a percentage to your chosen charity. You can choose any charity listed on the platform and increase your contribution percentage anytime from your dashboard. You can also make one-off donations independently.' },
      ].map((step, i) => (
        <div key={i} className="card mb-16">
          <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
            <div style={{fontSize:32,lineHeight:1}}>{step.emoji}</div>
            <div>
              <h2 style={{fontFamily:'var(--font-display)',fontSize:20,marginBottom:8}}>{step.title}</h2>
              <p style={{color:'var(--text-muted)',lineHeight:1.7,fontSize:15}}>{step.body}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="card card-green text-center mt-24" style={{padding:40}}>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:28,marginBottom:12}}>Ready to play with purpose?</h2>
        <p style={{color:'var(--text-muted)',marginBottom:24}}>Join thousands of golfers making every round count.</p>
        <Link to="/pricing" className="btn btn-primary btn-lg">Subscribe now →</Link>
      </div>
    </div>
  </div>
);

export default HowItWorks;
