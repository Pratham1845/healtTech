import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Activity, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, saveAuthUser } from '../lib/api';
import './Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const payload = isSignUp
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      console.log('Attempting to connect to:', endpoint);
      console.log('Payload:', payload);

      const user = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('Login successful:', user);
      saveAuthUser(user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      let errorMessage = 'Authentication failed';
      if (error.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
      } else if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 400) {
        errorMessage = error.message || 'Invalid input data';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Authentication failed';
      }
      
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
                <CheckCircle size={20} />
                <span>AI-powered posture analysis</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Real-time form correction</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Personalized health insights</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>24/7 AI coaching</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="login-form-panel">
          <div className="login-form-container">
            <div className="login-header">
              <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p>
                {isSignUp 
                  ? 'Start your journey to better health' 
                  : 'Sign in to access your health dashboard'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
              {apiError && <div className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>{apiError}</div>}
              
              {isSignUp && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <div className="label-flex">
                  <label>Password</label>
                  {!isSignUp && <a href="#" className="forgot-password">Forgot password?</a>}
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                  />
                  <button 
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                  </div>
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary w-full login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={20} />
                  </>
                )}
              </button>
              
              {!isSignUp && (
                <>
                  <div className="divider">
                    <span>or continue with</span>
                  </div>
                  
                  <button type="button" className="btn btn-secondary w-full google-btn">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M18.1713 8.36791H17.5001V8.33325H10.0001V11.6666H14.7096C14.0225 13.607 12.1763 14.9999 10.0001 14.9999C7.23882 14.9999 5.00007 12.7612 5.00007 9.99992C5.00007 7.23825 7.23882 4.99992 10.0001 4.99992C11.2746 4.99992 12.4342 5.48075 13.3171 6.26617L15.6742 3.909C14.1859 2.52217 12.1951 1.66659 10.0001 1.66659C5.39799 1.66659 1.66675 5.39784 1.66675 9.99992C1.66675 14.602 5.39799 18.3333 10.0001 18.3333C14.6021 18.3333 18.3334 14.602 18.3334 9.99992C18.3334 9.44117 18.2763 8.89575 18.1713 8.36791Z" fill="currentColor"/>
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}
            </form>
            
            <div className="login-footer">
              <p>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button 
                  className="toggle-mode-btn"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrors({});
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            <div className="demo-info">
              <p><strong>Demo Account:</strong></p>
              <p>Email: demo@zenith.com | Password: demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
