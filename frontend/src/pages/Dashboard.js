import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Dashboard.css';

const statusBadge = (status) => {
  const map = { active: 'badge-green', inactive: 'badge-grey', cancelled: 'badge-red', lapsed: 'badge-red' };
  return <span className={`badge ${map[status] || 'badge-grey'}`}>{status}</span>;
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [scores, setScores] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('subscription') === 'success') {
      toast.success('Subscription activated! Welcome to GolfGives 🎉');
      refreshUser();
    }
  }, [searchParams, refreshUser]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const isActive = user?.subscriptionStatus === 'active';
        const requests = [
          isActive ? API.get('/scores') : Promise.resolve({ data: { scores: [] } }),
          API.get('/draws'),
          API.get('/winners/my'),
        ];
        const [scoresRes, drawsRes, winnersRes] = await Promise.all(requests);
        setScores(scoresRes.data.scores || []);
        setDraws(drawsRes.data.draws?.slice(0, 3) || []);
        setWinnings(winnersRes.data.winnings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAll();
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Cancel your subscription? You\'ll keep access until the end of your billing period.')) return;
    try {
      await API.post('/subscriptions/cancel');
      toast.success('Subscription cancelled.');
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const isActive = user?.subscriptionStatus === 'active';
  const totalWon = winnings.reduce((s, w) => s + parseFloat(w.prizeAmount || 0), 0);

  return (
    <div className="page dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Hey, {user?.firstName} 👋</h1>
            <p className="page-subtitle">Here's your GolfGives overview</p>
          </div>
          {isActive && (
            <Link to="/scores" className="btn btn-primary">+ Add Score</Link>
          )}
        </div>

        {/* Subscription banner if inactive */}
        {!isActive && (
          <div className="inactive-banner">
            <div>
              <h3>Your subscription is {user?.subscriptionStatus}</h3>
              <p>Subscribe to enter monthly draws, log scores, and support charities.</p>
            </div>
            <Link to="/pricing" className="btn btn-primary">Subscribe now →</Link>
          </div>
        )}

        {/* Stats row */}
        <div className="dash-stats">
          <div className="card dash-stat">
            <div className="dash-stat-label">Subscription</div>
            <div className="dash-stat-value">{statusBadge(user?.subscriptionStatus)}</div>
            {user?.subscriptionEnd && (
              <div className="dash-stat-sub">
                {user.subscriptionStatus === 'active' ? 'Renews' : 'Expires'}: {format(new Date(user.subscriptionEnd), 'dd MMM yyyy')}
              </div>
            )}
          </div>
          <div className="card dash-stat">
            <div className="dash-stat-label">Scores logged</div>
            <div className="dash-stat-value font-display text-green" style={{fontSize:32}}>{scores.length}<span style={{fontSize:16,color:'var(--text-muted)'}}>/5</span></div>
          </div>
          <div className="card dash-stat">
            <div className="dash-stat-label">Your charity contribution</div>
            <div className="dash-stat-value font-display text-green" style={{fontSize:32}}>{user?.charityContributionPercent}%</div>
            <div className="dash-stat-sub">{user?.selectedCharity?.name || 'No charity selected'}</div>
          </div>
          <div className="card dash-stat">
            <div className="dash-stat-label">Total winnings</div>
            <div className="dash-stat-value font-display text-gold" style={{fontSize:32}}>£{totalWon.toFixed(2)}</div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="dash-grid">
          {/* Scores */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">My Scores</h2>
              <Link to="/scores" className="btn btn-secondary btn-sm">Manage</Link>
            </div>
            {scores.length === 0 ? (
              <div className="empty-state">
                <h3>No scores yet</h3>
                <p>{isActive ? 'Add your first Stableford score to enter monthly draws.' : 'Subscribe to start logging scores.'}</p>
                {isActive && <Link to="/scores" className="btn btn-primary mt-16 btn-sm">Add score</Link>}
              </div>
            ) : (
              <div className="score-list">
                {scores.map((s, i) => (
                  <div key={s.id} className="score-row">
                    <div className="score-rank">#{i + 1}</div>
                    <div className="score-info">
                      <div className="score-val">{s.score} <span>pts</span></div>
                      <div className="score-meta">{s.courseName || 'Unknown course'} · {format(new Date(s.playedAt), 'dd MMM yyyy')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent draws */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">Recent Draws</h2>
              <Link to="/draws" className="btn btn-secondary btn-sm">All draws</Link>
            </div>
            {draws.length === 0 ? (
              <div className="empty-state"><h3>No draws yet</h3><p>Draws are published monthly.</p></div>
            ) : (
              <div className="draw-list">
                {draws.map((d) => (
                  <Link to={`/draws/${d.id}`} key={d.id} className="draw-row">
                    <div>
                      <div className="draw-name">{d.name}</div>
                      {d.drawnNumbers && (
                        <div className="draw-numbers">
                          {d.drawnNumbers.map((n) => <span key={n} className="draw-num">{n}</span>)}
                        </div>
                      )}
                    </div>
                    <span className={`badge ${d.status === 'published' ? 'badge-green' : 'badge-grey'}`}>{d.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Winnings */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">My Winnings</h2>
            </div>
            {winnings.length === 0 ? (
              <div className="empty-state"><h3>No winnings yet</h3><p>Keep entering scores — your match could be next month!</p></div>
            ) : (
              <div className="win-list">
                {winnings.map((w) => (
                  <div key={w.id} className="win-row">
                    <div>
                      <div className="win-match">{w.matchType} match 🏆</div>
                      <div className="win-draw">{w.draw?.name}</div>
                    </div>
                    <div className="win-right">
                      <div className="win-amount">£{parseFloat(w.prizeAmount).toFixed(2)}</div>
                      <span className={`badge badge-sm ${w.paymentStatus === 'paid' ? 'badge-green' : w.paymentStatus === 'rejected' ? 'badge-red' : 'badge-gold'}`}>{w.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscription management */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">Account</h2>
            </div>
            <div className="account-rows">
              <div className="account-row"><span>Email</span><strong>{user?.email}</strong></div>
              <div className="account-row"><span>Plan</span><strong>{user?.subscriptionPlan || '—'}</strong></div>
              <div className="account-row"><span>Charity %</span><strong>{user?.charityContributionPercent}%</strong></div>
              <div className="account-row"><span>Country</span><strong>{user?.country}</strong></div>
            </div>
            <div className="account-actions">
              <Link to="/charities" className="btn btn-secondary btn-sm">Change charity</Link>
              {isActive && (
                <button className="btn btn-danger btn-sm" onClick={handleCancelSubscription}>Cancel subscription</button>
              )}
              {!isActive && (
                <Link to="/pricing" className="btn btn-primary btn-sm">Reactivate</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
