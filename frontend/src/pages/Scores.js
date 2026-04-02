import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Scores.css';

const MAX_SCORES = 5;

const ScoreForm = ({ onSave, editing, onCancel }) => {
  const [form, setForm] = useState(
    editing || { score: '', playedAt: new Date().toISOString().split('T')[0], courseName: '', notes: '' }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.score || form.score < 1 || form.score > 45)
      return toast.error('Score must be between 1 and 45');
    setLoading(true);
    try {
      if (editing) {
        await API.put(`/scores/${editing.id}`, form);
        toast.success('Score updated');
      } else {
        await API.post('/scores', form);
        toast.success('Score added! Rolling record updated.');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="score-form" onSubmit={handleSubmit}>
      <h3>{editing ? 'Edit Score' : 'Add New Score'}</h3>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Stableford Score (1–45)</label>
          <input className="form-input score-input" type="number" name="score" min="1" max="45" value={form.score}
            onChange={handleChange} placeholder="e.g. 32" required />
        </div>
        <div className="form-group">
          <label className="form-label">Date played</label>
          <input className="form-input" type="date" name="playedAt" value={form.playedAt} onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} required />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Course name (optional)</label>
        <input className="form-input" type="text" name="courseName" value={form.courseName}
          onChange={handleChange} placeholder="e.g. St Andrews Links" />
      </div>
      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <textarea className="form-textarea" name="notes" value={form.notes}
          onChange={handleChange} placeholder="Weather conditions, highlights…" rows={2} />
      </div>
      <div className="score-form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : editing ? 'Update score' : 'Add score'}
        </button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

const Scores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchScores = async () => {
    try {
      const { data } = await API.get('/scores');
      setScores(data.scores || []);
    } catch (err) {
      toast.error('Could not load scores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await API.delete(`/scores/${id}`);
      toast.success('Score deleted');
      fetchScores();
    } catch {
      toast.error('Failed to delete score');
    }
  };

  const onSave = () => {
    setShowForm(false);
    setEditing(null);
    fetchScores();
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page scores-page">
      <div className="container">
        <div className="section-header">
          <div>
            <h1 className="page-title">My Scores</h1>
            <p className="page-subtitle">Your latest {MAX_SCORES} Stableford scores — these enter you into monthly draws</p>
          </div>
          {!showForm && scores.length < MAX_SCORES && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add score</button>
          )}
        </div>

        {/* Rolling logic explanation */}
        <div className="score-info-bar">
          <div className="score-counter">
            <span className="score-counter-num">{scores.length}</span>
            <span className="score-counter-of">/ {MAX_SCORES}</span>
            <span className="score-counter-label">scores stored</span>
          </div>
          <p className="score-info-text">
            {scores.length === MAX_SCORES
              ? '⚡ Your record is full. Adding a new score will automatically replace your oldest one.'
              : `Add ${MAX_SCORES - scores.length} more score${MAX_SCORES - scores.length !== 1 ? 's' : ''} to fill your record.`}
          </p>
          {scores.length === MAX_SCORES && !showForm && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>+ Add (replace oldest)</button>
          )}
        </div>

        {/* Add/edit form */}
        {(showForm || editing) && (
          <div className="card mb-24">
            <ScoreForm
              onSave={onSave}
              editing={editing}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        )}

        {/* Scores list */}
        {scores.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div style={{fontSize:48,marginBottom:16}}>⛳</div>
              <h3>No scores yet</h3>
              <p>Add your first Stableford score to start entering monthly draws.</p>
              {!showForm && (
                <button className="btn btn-primary mt-16" onClick={() => setShowForm(true)}>Add my first score</button>
              )}
            </div>
          </div>
        ) : (
          <div className="scores-grid">
            {scores.map((s, i) => (
              <div key={s.id} className={`score-card${i === scores.length - 1 && scores.length === MAX_SCORES ? ' oldest' : ''}`}>
                <div className="score-card-top">
                  <div className="score-card-num">{s.score}</div>
                  <div className="score-card-pts">pts</div>
                  {i === 0 && <span className="badge badge-green score-latest">Latest</span>}
                  {i === scores.length - 1 && scores.length === MAX_SCORES && (
                    <span className="badge badge-grey score-oldest">Oldest</span>
                  )}
                </div>
                <div className="score-card-info">
                  <div className="score-card-course">{s.courseName || 'Course not specified'}</div>
                  <div className="score-card-date">{format(new Date(s.playedAt), 'EEEE, dd MMM yyyy')}</div>
                  {s.notes && <div className="score-card-notes">"{s.notes}"</div>}
                </div>
                <div className="score-card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(s); setShowForm(false); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stableford guide */}
        <div className="card mt-24 stableford-guide">
          <h3>📖 Stableford scoring guide</h3>
          <div className="stableford-grid">
            {[
              {result:'Hole in one / Albatross', pts:'5+ pts'},{result:'Eagle', pts:'4 pts'},
              {result:'Birdie', pts:'3 pts'},{result:'Par', pts:'2 pts'},
              {result:'Bogey', pts:'1 pt'},{result:'Double bogey or worse', pts:'0 pts'},
            ].map((row, i) => (
              <div key={i} className="stableford-row">
                <span>{row.result}</span><span className="text-green">{row.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scores;
