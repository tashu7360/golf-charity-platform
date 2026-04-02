import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Draws.css';

const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const DrawsList = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/draws').then(({ data }) => setDraws(data.draws || [])).catch(() => toast.error('Could not load draws')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page draws-page">
      <div className="container">
        <h1 className="page-title">Monthly Draws</h1>
        <p className="page-subtitle">Every month, 5 numbers are drawn. Match your Stableford scores to win.</p>

        <div className="draws-list">
          {draws.length === 0 ? (
            <div className="empty-state"><h3>No draws yet</h3><p>The first draw will be published soon.</p></div>
          ) : draws.map((d) => (
            <Link to={`/draws/${d.id}`} key={d.id} className="draw-card">
              <div className="draw-card-left">
                <div className="draw-month-badge">{months[d.month]}</div>
                <div>
                  <h3 className="draw-card-name">{d.name}</h3>
                  <p className="draw-card-sub">{d.totalParticipants} participants · £{parseFloat(d.totalPool || 0).toFixed(2)} pool</p>
                </div>
              </div>
              <div className="draw-card-right">
                {d.status === 'published' && d.drawnNumbers && (
                  <div className="draw-numbers-sm">
                    {d.drawnNumbers.map((n) => <span key={n} className="draw-ball">{n}</span>)}
                  </div>
                )}
                <span className={`badge ${d.status === 'published' ? 'badge-green' : d.status === 'simulated' ? 'badge-blue' : 'badge-grey'}`}>{d.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DrawDetail = () => {
  const { id } = useParams();
  const [draw, setDraw] = useState(null);
  const [myEntry, setMyEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/draws/${id}`)
      .then(({ data }) => { setDraw(data.draw); setMyEntry(data.myEntry); })
      .catch(() => toast.error('Could not load draw'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!draw) return <div className="page"><div className="container"><p>Draw not found.</p></div></div>;

  const matchBadge = (type) => {
    if (type === '5-match') return <span className="badge badge-gold">🏆 Jackpot!</span>;
    if (type === '4-match') return <span className="badge badge-green">🥈 4-match</span>;
    if (type === '3-match') return <span className="badge badge-blue">🥉 3-match</span>;
    return <span className="badge badge-grey">No match</span>;
  };

  return (
    <div className="page draw-detail-page">
      <div className="container">
        <Link to="/draws" className="back-link">← All draws</Link>
        <h1 className="page-title">{draw.name}</h1>
        <p className="page-subtitle">
          {draw.status === 'published' && draw.publishedAt
            ? `Published ${format(new Date(draw.publishedAt), 'dd MMM yyyy')}`
            : `Status: ${draw.status}`}
        </p>

        {/* Drawn numbers */}
        {draw.status === 'published' && draw.drawnNumbers ? (
          <div className="card draw-numbers-hero">
            <h2>Drawn numbers</h2>
            <div className="draw-balls-large">
              {draw.drawnNumbers.map((n) => (
                <div key={n} className={`ball-lg${myEntry?.scores?.some(s => (s.score || s) === n) ? ' matched' : ''}`}>
                  {n}
                </div>
              ))}
            </div>
            <p className="draw-hint">Numbers highlighted in green matched your scores</p>
          </div>
        ) : (
          <div className="card draw-pending-card">
            <div style={{fontSize:48}}>🎲</div>
            <h2>Draw {draw.status === 'pending' ? 'not yet run' : 'simulated'}</h2>
            <p>This draw hasn't been published yet. Check back soon!</p>
          </div>
        )}

        {/* My entry */}
        {myEntry && (
          <div className="card draw-my-entry">
            <h2 className="section-title">My Entry</h2>
            <div className="my-entry-content">
              <div className="my-scores-row">
                <span className="text-muted text-sm">My scores entered:</span>
                <div className="my-balls">
                  {myEntry.scores?.map((s, i) => (
                    <div key={i} className={`ball-sm${myEntry.matchedNumbers?.includes(s.score || s) ? ' matched' : ''}`}>
                      {s.score || s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="my-result">
                <span>Result:</span>
                {matchBadge(myEntry.matchType)}
                {myEntry.prizeAmount > 0 && (
                  <span className="text-gold font-display" style={{fontSize:24}}>£{parseFloat(myEntry.prizeAmount).toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prize pool breakdown */}
        <div className="card prize-breakdown-card">
          <h2 className="section-title">Prize Pool</h2>
          <div className="prize-rows">
            <div className="prize-row prize-row-jackpot">
              <span>🏆 Jackpot (5-match)</span>
              <span className="text-gold font-display" style={{fontSize:22}}>£{parseFloat(draw.jackpotPool).toFixed(2)}</span>
              {draw.jackpotRolledOver && <span className="badge badge-gold">Rolled over →</span>}
            </div>
            <div className="prize-row">
              <span>🥈 4-Number Match</span>
              <span className="font-display" style={{fontSize:22}}>£{parseFloat(draw.fourMatchPool).toFixed(2)}</span>
            </div>
            <div className="prize-row">
              <span>🥉 3-Number Match</span>
              <span className="font-display" style={{fontSize:22}}>£{parseFloat(draw.threeMatchPool).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Winners */}
        {draw.winners?.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-16">Winners</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Match</th><th>Prize</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {draw.winners.map((w) => (
                    <tr key={w.id}>
                      <td>{w.user?.firstName} {w.user?.lastName}</td>
                      <td>{matchBadge(w.matchType)}</td>
                      <td className="text-gold font-display">£{parseFloat(w.prizeAmount).toFixed(2)}</td>
                      <td><span className={`badge ${w.paymentStatus === 'paid' ? 'badge-green' : w.paymentStatus === 'rejected' ? 'badge-red' : 'badge-gold'}`}>{w.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
