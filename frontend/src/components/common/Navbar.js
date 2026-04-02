import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⛳</span>
          <span className="logo-text">Golf<span className="logo-accent">Gives</span></span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`hamburger${menuOpen ? ' open' : ''}`} />
        </button>

        <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
          <Link to="/charities" className={`nav-link${location.pathname === '/charities' ? ' active' : ''}`}>Charities</Link>
          <Link to="/draws" className={`nav-link${location.pathname.startsWith('/draws') ? ' active' : ''}`}>Draws</Link>
          <Link to="/how-it-works" className={`nav-link${location.pathname === '/how-it-works' ? ' active' : ''}`}>How It Works</Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className={`nav-link${location.pathname.startsWith('/admin') ? ' active' : ''}`}>Admin</Link>
              )}
              <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/pricing" className="btn btn-primary btn-sm">Subscribe</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
