import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './Charities.css';

const categories = ['All', 'Youth & Sport', 'Health & Research', 'Health & Wellbeing', 'Children & Education', 'Environment'];

const CharityCard = ({ charity, selectedId, onSelect }) => {
  const isSelected = selectedId === charity.id;
  const [donating, setDonating] = useState(false);
  const [amount, setAmount] = useState('');
  const { user } = useAuth();

  const handleSelect = async () => {
    try {
      await API.put('/auth/profile', { selectedCharityId: charity.id });
      onSelect(charity.id);
      toast.success(`${charity.name} set as your charity 💚`);
    } catch {
      toast.error('Failed to update charity');
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    try {
      await API.post(`/charities/${charity.id}/donate`, { amount: parseFloat(amount) });
      toast.success(`£${amount} donated to ${charity.name} 💚`);
      setDonating(false);
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Donation failed');
    }
  };

  return (
    <div className={`charity-card${isSelected ? ' selected' : ''}`}>
      {charity.isFeatured && <div className="featured-ribbon">⭐ Featured</div>}
      <div className="charity-img">
        {charity.imageUrl
          ? <img src={charity.imageUrl} alt={charity.name} />
          : <div className="charity-img-placeholder">🫶</div>}
      </div>
      <div className="charity-body">
        <div className="charity-meta">
          <span className="badge badge-green">{charity.category}</span>
          <span className="charity-country">{charity.country}</span>
        </div>
        <h3 className="charity-name">{charity.name}</h3>
        <p className="charity-desc">{charity.description}</p>
        {charity.upcomingEvents?.length > 0 && (
          <div className="charity-events">
            <h4>Upcoming events</h4>
            {charity.upcomingEvents.map((ev, i) => (
              <div key={i} className="event-row">
                <span>🏌️ {ev.title}</span>
                <span className="event-date">{ev.date} · {ev.location}</span>
              </div>
            ))}
          </div>
        )}
        <div className="charity-total">
          <span>Total raised:</span>
          <span className="text-green">£{parseFloat(charity.totalReceived || 0).toLocaleString()}</span>
        </div>
        {charity.website && (
          <a href={charity.website} target="_blank" rel="noreferrer" className="charity-link">Visit website →</a>
        )}
      </div>
      {user && (
        <div className="charity-actions">
          {isSelected ? (
            <button className="btn btn-primary btn-full" disabled>✓ Your charity</button>
          ) : (
            <button className="btn btn-secondary btn-full" onClick={handleSelect}>Select this charity</button>
          )}
          {!donating ? (
            <button className="btn btn-ghost btn-full" onClick={() => setDonating(true)}>Make a one-off donation</button>
          ) : (
            <form className="donate-form" onSubmit={handleDonate}>
              <input className="form-input" type="number" min="1" step="0.01" placeholder="Amount (£)" value={amount}
                onChange={(e) => setAmount(e.target.value)} />
              <button type="submit" className="btn btn-gold btn-sm">Donate £{amount || '—'}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDonating(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

const Charities = () => {
  const { user, updateUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(user?.selectedCharityId || null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category !== 'All') params.append('category', category);
        const { data } = await API.get(`/charities?${params}`);
        setCharities(data.charities || []);
      } catch { toast.error('Failed to load charities'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [search, category]);

  const handleSelect = (id) => {
    setSelectedId(id);
    updateUser({ selectedCharityId: id });
  };

  return (
    <div className="page charities-page">
      <div className="container">
        <h1 className="page-title">Charities</h1>
        <p className="page-subtitle">Choose the cause your subscription supports — and give more whenever you like.</p>

        {/* Filters */}
        <div className="charity-filters">
          <input className="form-input search-input" type="search" placeholder="🔍  Search charities…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="category-pills">
            {categories.map((c) => (
              <button key={c} className={`pill${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{minHeight:300}}><div className="spinner" /></div>
        ) : charities.length === 0 ? (
          <div className="empty-state"><h3>No charities found</h3><p>Try a different search or category.</p></div>
        ) : (
          <div className="charities-grid">
            {charities.map((c) => (
              <CharityCard key={c.id} charity={c} selectedId={selectedId} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Charities;
