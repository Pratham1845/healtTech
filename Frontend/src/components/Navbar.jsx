import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, User, Scan, LogIn, LogOut } from 'lucide-react';
import { clearAuthUser, getAuthToken } from '../lib/api';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()));
  }, [location]);

  const handleLogout = () => {
    clearAuthUser();
    setIsLoggedIn(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Workout', href: '/workout' },
    { name: 'Emotions', href: '/emotions' },
    { name: 'Chatbot', href: '/chatbot' },
    { name: 'Analytics', href: '/stats' },
    { name: 'History', href: '/history' }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <Activity className="logo-icon" size={28} />
          <span className="logo-text">Zenith Health</span>
        </Link>

        <div className="nav-links desktop-only">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="nav-actions desktop-only">
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="nav-icon-btn" title="Profile">
                <User size={20} />
              </Link>
              <Link to="/workout" className="btn btn-primary btn-sm">
                <Scan size={16} />
                Start Scan
              </Link>
              <button className="nav-icon-btn" title="Logout" onClick={handleLogout}>
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>

        <button
          className="mobile-menu-btn mobile-only"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className={`mobile-nav-link ${location.pathname === link.href ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="mobile-menu-actions">
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <User size={18} /> Profile
              </Link>
              <button className="mobile-nav-link" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              <LogIn size={18} /> Login
            </Link>
          )}
        </div>
        <Link to="/workout" className="btn btn-primary mobile-cta" onClick={() => setIsMobileMenuOpen(false)}>
          <Scan size={18} />
          Start Scan
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
