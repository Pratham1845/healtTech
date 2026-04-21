import { ArrowRight, Lock, Mail } from 'lucide-react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-page">
      <div className="container login-container">
        <div className="login-card glass-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Log in to access your Zenith Health dashboard.</p>
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
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <a href="#">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
