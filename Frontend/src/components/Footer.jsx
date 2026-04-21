import { Activity, MessageCircle, Globe, Share2 } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-grid">
          
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <a href="#" className="logo">
              <Activity className="logo-icon" size={28} />
              <span className="logo-text">Zenith Health</span>
            </a>
            <p>Empowering individuals to reach their peak physical and mental state through accessible, AI-driven insights.</p>
          </div>

          {/* Links Column */}
          <div className="footer-col links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/login">Login</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          {/* Social Column */}
          <div className="footer-col social-col">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" className="social-icon"><MessageCircle size={20} /></a>
              <a href="#" className="social-icon"><Globe size={20} /></a>
              <a href="#" className="social-icon"><Share2 size={20} /></a>
            </div>
            <div className="contact-info mt-4">
              <p>hello@zenithhealth.ai</p>
              <p>San Francisco, CA</p>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-flex">
          <p>&copy; {new Date().getFullYear()} Zenith Health. All rights reserved.</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
