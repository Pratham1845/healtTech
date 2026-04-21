import { ArrowRight, Lock, Mail, Shield, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-split">
        {/* Left Side - Brand Panel */}
        <div className="login-brand-panel">
          <div className="brand-content">
            <div className="brand-logo">
              <Activity size={48} />
              <h1>Zenith Health</h1>
            </div>
            
            <div className="brand-message">
              <h2>Your Health, <span className="text-gradient">Intelligently</span> Managed</h2>
              <p>Access your personalized health dashboard with AI-powered insights, real-time posture analysis, and customized wellness recommendations.</p>
            </div>
            
            <div className="brand-features">
              <div className="feature-item">
                <Shield size={20} />
                <span>Enterprise-grade security</span>
              </div>
              <div className="feature-item">
                <Shield size={20} />
                <span>HIPAA compliant</span>
              </div>
              <div className="feature-item">
                <Shield size={20} />
                <span>End-to-end encryption</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="login-form-panel">
          <div className="login-form-container">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Log in to access your Zenith Health dashboard</p>
            </div>
            
            <form className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input type="email" placeholder="alex@example.com" />
                </div>
              </div>
              
              <div className="form-group">
                <div className="label-flex">
                  <label>Password</label>
                  <a href="#" className="forgot-password">Forgot password?</a>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>
              
              <button type="button" className="btn btn-primary w-full login-btn">
                Sign In <ArrowRight size={20} />
              </button>
              
              <div className="divider">
                <span>or continue with</span>
              </div>
              
              <button type="button" className="btn btn-secondary w-full google-btn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M18.1713 8.36791H17.5001V8.33325H10.0001V11.6666H14.7096C14.0225 13.607 12.1763 14.9999 10.0001 14.9999C7.23882 14.9999 5.00007 12.7612 5.00007 9.99992C5.00007 7.23825 7.23882 4.99992 10.0001 4.99992C11.2746 4.99992 12.4342 5.48075 13.3171 6.26617L15.6742 3.909C14.1859 2.52217 12.1951 1.66659 10.0001 1.66659C5.39799 1.66659 1.66675 5.39784 1.66675 9.99992C1.66675 14.602 5.39799 18.3333 10.0001 18.3333C14.6021 18.3333 18.3334 14.602 18.3334 9.99992C18.3334 9.44117 18.2763 8.89575 18.1713 8.36791Z" fill="currentColor"/>
                </svg>
                Continue with Google
              </button>
            </form>
            
            <div className="login-footer">
              <p>Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
