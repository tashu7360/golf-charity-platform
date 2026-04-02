import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Admin.css';

/* ─── Sidebar ─── */
const navItems = [
  { path: '/admin', label: 'Overview', icon: '📊' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/draws', label: 'Draws', icon: '🎲' },
  { path: '/admin/charities', label: 'Charities', icon: '💚' },
  { path: '/admin/winners', label: 'Winners', icon: '🏆' },
];

const AdminSidebar = () => {
  const { pathname } = useLocation();
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <span>⛳</span> Admin
      </div>
      <nav className="admin-nav">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}
            className={`admin-nav-item${pathname === item.path ? ' active' : ''}`}>
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>
      <Link to="/dashboard" className="admin-nav-item back-to-site">← Back to site</Link>
    </aside>
  );
};

/* ─── Overview ─── */
const AdminOverview = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    API.get('/admin/analytics').then(({ data }) => setData(data.analytics)).catch(console.error);
  }, []);
  if (!data) return <div className="flex-center" style={{height:300}}><div className="spinner" /></div>;
  return (
    <div className="admin-content">
      <h1 className="admin-page-title">Overview</h1>
      <div className="admin-stats">
        {[
          { label: 'Total Users', value: data.totalUsers, color: 'green' },
          { label: 'Active Subscribers', value: data.activeSubscribers, color: 'green' },
          { label: 'Total Revenue', value: `£${parseFloat(data.totalRevenue).toFixed(2)}`, color: 'gold' },
          { label: 'Charity Contributions', value: `£${parseFloat(data.totalCharityContributions).toFixed(2)}`, color: 'gold' },
          { label: 'Draws Published', value: data.publishedDraws, color: '' },
          { label: 'Pending Verifications', value: data.pendingWinners, color: data.pendingWinners > 0 ? 'red' : '' },
        ].map((s, i) => (
          <div key={i} className="admin-stat-card">
            <div className={`admin-stat-val ${s.color}`}>{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="admin-section">
        <h2 className="section-title mb-16">Recent Signups</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {data.recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge ${u.subscriptionStatus === 'active' ? 'badge-green' : 'badge-grey'}`}>{u.subscriptionStatus}</span></td>
                  <td className="text-muted">{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Users ─── */
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    API.get(`/admin/users?search=${search}`)
      .then(({ data }) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="admin-content">
      <h1 className="admin-page-title">Users</h1>
      <div className="admin-toolbar">
        <input className="form-input" placeholder="🔍 Search users…" value={search}
          onChange={(e) => setSearch(e.target.value)} style={{maxWidth:320}} />
      </div>
      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Charity %</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td className="text-muted text-sm">{u.email}</td>
                  <td>{u.subscriptionPlan || '—'}</td>
                  <td><span className={`badge ${u.subscriptionStatus === 'active' ? 'badge-green' : 'badge-grey'}`}>{u.subscriptionStatus}</span></td>
                  <td>{u.charityContributionPercent}%</td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/users/${u.id}`)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── User Detail ─── */
const AdminUserDetail = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    API.get(`/admin/users/${id}`).then(({ data }) => setUser(data.user)).catch(console.error);
  }, [id]);

  const handleUpdate = async (updates) => {
    try {
      await API.put(`/admin/users/${id}`, updates);
      toast.success('User updated');
      API.get(`/admin/users/${id}`).then(({ data }) => setUser(data.user));
    } catch { toast.error('Update failed'); }
  };

  if (!user) return <div className="flex-center" style={{height:300}}><div className="spinner" /></div>;

  return (
    <div className="admin-content">
      <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate('/admin/users')}>← Back</button>
      <h1 className="admin-page-title">{user.firstName} {user.lastName}</h1>
      <div className="admin-grid-2">
        <div className="card">
          <h3 className="section-title mb-16">Profile</h3>
          <div className="account-rows">
            {[
              ['Email', user.email],
              ['Plan', user.subscriptionPlan || '—'],
              ['Status', user.subscriptionStatus],
              ['Country', user.country],
              ['Handicap', user.handicap || '—'],
              ['Charity %', user.charityContributionPercent + '%'],
              ['Total Winnings', '£' + parseFloat(user.totalWinnings).toFixed(2)],
            ].map(([k, v]) => (
              <div key={k} className="account-row"><span>{k}</span><strong>{v}</strong></div>
            ))}
          </div>
          <div style={{marginTop:16, display:'flex', gap:8}}>
            {user.subscriptionStatus !== 'active' && (
              <button className="btn btn-primary btn-sm" onClick={() => handleUpdate({ subscriptionStatus: 'active' })}>Activate</button>
            )}
            {user.subscriptionStatus === 'active' && (
              <button className="btn btn-danger btn-sm" onClick={() => handleUpdate({ subscriptionStatus: 'cancelled' })}>Cancel Sub</button>
            )}
          </div>
        </div>
        <div className="card">
          <h3 className="section-title mb-16">Scores</h3>
          {user.scores?.length === 0
            ? <p className="text-muted">No scores</p>
            : user.scores?.map((s) => (
              <div key={s.id} style={{padding:'10px', background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)', marginBottom:8, display:'flex', gap:12, alignItems:'center'}}>
                <span className="text-green font-display" style={{fontSize:22}}>{s.score}</span>
                <span className="text-muted text-sm">{s.courseName || 'No course'} · {s.playedAt}</span>
              </div>
            ))}
        </div>
        <div className="card">
          <h3 className="section-title mb-16">Winnings</h3>
          {user.winnings?.length === 0
            ? <p className="text-muted">No winnings</p>
            : user.winnings?.map((w) => (
              <div key={w.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
                <span>{w.draw?.name} · {w.matchType}</span>
                <span className="text-gold">£{parseFloat(w.prizeAmount).toFixed(2)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Draws ─── */
const AdminDraws = () => {
  const [draws, setDraws] = useState([]);
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), drawType: 'random' });
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDraws = () => {
    API.get('/draws').then(({ data }) => setDraws(data.draws || [])).finally(() => setLoading(false));
  };

  // ✅ FIX 1
  useEffect(() => { fetchDraws(); }, []);

  const createDraw = async () => {
    try { await API.post('/admin/draws', form); toast.success('Draw created'); fetchDraws(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const simulate = async (id) => {
    try {
      const { data } = await API.post(`/admin/draws/${id}/simulate`);
      setSimResult(data.simulation);
      toast.success('Simulation complete');
      fetchDraws();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const publish = async (id) => {
    if (!window.confirm('Publish this draw? This cannot be undone.')) return;
    try {
      await API.post(`/admin/draws/${id}/publish`);
      toast.success('Draw published! Winners created.');
      fetchDraws();
      setSimResult(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="admin-content">
      <h1 className="admin-page-title">Draws</h1>
      <div className="card mb-24">
        <h3 className="section-title mb-16">Create New Draw</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Month</label>
            <select className="form-select" value={form.month} onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}>
              {months.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} />
          </div>
          <div className="form-group">
            <label className="form-label">Draw type</label>
            <select className="form-select" value={form.drawType} onChange={(e) => setForm({ ...form, drawType: e.target.value })}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={createDraw}>Create draw</button>
      </div>

      {simResult && (
        <div className="card mb-24 sim-result">
          <h3>Simulation result — Numbers: [{simResult.drawnNumbers?.join(', ')}]</h3>
          <div className="sim-stats">
            <span>5-match: <strong className="text-gold">{simResult.fiveMatch}</strong></span>
            <span>4-match: <strong className="text-green">{simResult.fourMatch}</strong></span>
            <span>3-match: <strong>{simResult.threeMatch}</strong></span>
          </div>
        </div>
      )}

      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Draw</th><th>Pool</th><th>Participants</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {draws.map((d) => (
                <tr key={d.id}>
                  <td><Link to={`/draws/${d.id}`}>{d.name}</Link></td>
                  <td className="text-gold">£{parseFloat(d.totalPool).toFixed(2)}</td>
                  <td>{d.totalParticipants}</td>
                  <td><span className={`badge ${d.status === 'published' ? 'badge-green' : d.status === 'simulated' ? 'badge-blue' : 'badge-grey'}`}>{d.status}</span></td>
                  <td>
                    <div style={{display:'flex', gap:8}}>
                      {d.status !== 'published' && <button className="btn btn-secondary btn-sm" onClick={() => simulate(d.id)}>Simulate</button>}
                      {d.status !== 'published' && <button className="btn btn-gold btn-sm" onClick={() => publish(d.id)}>Publish</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Charities Admin ─── */
const AdminCharities = () => {
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', category: '', country: '', website: '', isFeatured: false });
  const [editing, setEditing] = useState(null);

  const fetchCharities = () => {
    API.get('/charities').then(({ data }) => setCharities(data.charities || []));
  };

  // ✅ FIX 2
  useEffect(() => { fetchCharities(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/admin/charities/${editing.id}`, form); toast.success('Charity updated'); }
      else { await API.post('/admin/charities', form); toast.success('Charity created'); }
      setForm({ name: '', description: '', category: '', country: '', website: '', isFeatured: false });
      setEditing(null);
      fetchCharities();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    try { await API.delete(`/admin/charities/${id}`); toast.success('Deleted'); fetchCharities(); }
    catch { toast.error('Failed'); }
  };

  const startEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description, category: c.category || '', country: c.country || '', website: c.website || '', isFeatured: c.isFeatured });
  };

  return (
    <div className="admin-content">
      <h1 className="admin-page-title">Charities</h1>
      <div className="card mb-24">
        <h3 className="section-title mb-16">{editing ? 'Edit Charity' : 'Add Charity'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Country</label>
              <input className="form-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
          </div>
          <label style={{display:'flex', alignItems:'center', gap:8, marginBottom:16, fontSize:14, cursor:'pointer'}}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Feature on homepage
          </label>
          <div style={{display:'flex', gap:8}}>
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={() => {
                setEditing(null);
                setForm({ name: '', description: '', category: '', country: '', website: '', isFeatured: false });
              }}>Cancel</button>
            )}
          </div>
        </form>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Featured</th><th>Total Raised</th><th>Actions</th></tr></thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="text-muted">{c.category || '—'}</td>
                <td>{c.isFeatured ? '⭐' : '—'}</td>
                <td className="text-green">£{parseFloat(c.totalReceived || 0).toFixed(2)}</td>
                <td>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Winners ─── */
const AdminWinners = () => {
  const [winners, setWinners] = useState([]);
  const [filter, setFilter] = useState('');

  const fetchWinners = () => {
    API.get(`/admin/winners${filter ? '?status=' + filter : ''}`).then(({ data }) => setWinners(data.winners || []));
  };

  // ✅ FIX 3
  useEffect(() => { fetchWinners(); }, [filter]);

  const verify = async (id, action) => {
    try { await API.put(`/admin/winners/${id}/verify`, { action }); toast.success(`Winner ${action}d`); fetchWinners(); }
    catch { toast.error('Failed'); }
  };

  const markPaid = async (id) => {
    try { await API.put(`/admin/winners/${id}/pay`); toast.success('Marked as paid'); fetchWinners(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-content">
      <h1 className="admin-page-title">Winners</h1>
      <div className="admin-toolbar mb-24">
        {['', 'pending', 'verification_required', 'verified', 'paid', 'rejected'].map((s) => (
          <button key={s} className={`pill${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Winner</th><th>Draw</th><th>Match</th><th>Prize</th><th>Status</th><th>Proof</th><th>Actions</th></tr></thead>
          <tbody>
            {winners.map((w) => (
              <tr key={w.id}>
                <td>
                  {w.user?.firstName} {w.user?.lastName}<br/>
                  <span className="text-muted text-sm">{w.user?.email}</span>
                </td>
                <td className="text-muted text-sm">{w.draw?.name}</td>
                <td><span className="badge badge-gold">{w.matchType}</span></td>
                <td className="text-gold font-display">£{parseFloat(w.prizeAmount).toFixed(2)}</td>
                <td>
                  <span className={`badge ${w.paymentStatus === 'paid' ? 'badge-green' : w.paymentStatus === 'rejected' ? 'badge-red' : 'badge-gold'}`}>
                    {w.paymentStatus}
                  </span>
                </td>
                <td>
                  {w.proofImageUrl
                    ? <a href={`${process.env.REACT_APP_API_URL?.replace('/api','')}${w.proofImageUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View</a>
                    : '—'}
                </td>
                <td>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                    {w.paymentStatus === 'verification_required' && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => verify(w.id, 'approve')}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => verify(w.id, 'reject')}>Reject</button>
                      </>
                    )}
                    {w.paymentStatus === 'verified' && (
                      <button className="btn btn-gold btn-sm" onClick={() => markPaid(w.id)}>Mark Paid</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {winners.length === 0 && (
              <tr><td colSpan={7} style={{textAlign:'center', padding:'40px', color:'var(--text-muted)'}}>No winners found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Admin shell ─── */
const Admin = () => (
  <div className="admin-shell">
    <AdminSidebar />
    <main className="admin-main">
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="draws" element={<AdminDraws />} />
        <Route path="charities" element={<AdminCharities />} />
        <Route path="winners" element={<AdminWinners />} />
      </Routes>
    </main>
  </div>
);

export default Admin;