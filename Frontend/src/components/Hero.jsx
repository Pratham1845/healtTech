import { Link } from 'react-router-dom';
import { Play, ArrowRight, Activity } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="container hero-container split-layout">
        
        {/* Left Side: Content */}
        <div className="hero-content animate-fade-up">
          <div className="hero-badge">
            <Activity size={16} />
            <span>AI-Powered Health Intelligence</span>
          </div>
          
          <h1 className="hero-title">
            Reach Your <span className="text-gradient">Peak Health</span>
          </h1>
          
          <p className="hero-subtitle">
            AI-powered posture, mood, and fitness monitoring using only your camera.
          </p>
          
          <p className="hero-support-text">
            No wearables. No expensive devices. Real-time intelligent health insights powered by cutting-edge computer vision.
          </p>
          
          <div className="hero-cta-group">
            <Link to="/workout" className="btn btn-primary btn-lg">
              Start Free Scan
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Login
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Accuracy</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-number">4.9★</span>
              <span className="stat-label">User Rating</span>
            </div>
          </div>
        </div>

        {/* Right Side: Premium Visual */}
        <div className="hero-visual animate-slide-right">
          <div className="dashboard-mockup glass-card">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <span className="mockup-title">Health Dashboard</span>
            </div>
            
            <div className="mockup-content">
              <div className="mockup-row">
                <div className="mockup-stat">
                  <span className="mockup-label">Health Score</span>
                  <span className="mockup-value text-gradient">94</span>
                </div>
                <div className="mockup-stat">
                  <span className="mockup-label">Mood</span>
                  <span className="mockup-value text-gradient">Focused</span>
                </div>
              </div>
              
              <div className="mockup-row">
                <div className="mockup-stat">
                  <span className="mockup-label">Form Accuracy</span>
                  <span className="mockup-value text-gradient">98%</span>
                </div>
                <div className="mockup-stat">
                  <span className="mockup-label">Risk Level</span>
                  <span className="mockup-value text-gradient">Low</span>
                </div>
              </div>
              
              <div className="mockup-chart">
                <div className="chart-bar" style={{height: '60%'}}></div>
                <div className="chart-bar" style={{height: '80%'}}></div>
                <div className="chart-bar" style={{height: '45%'}}></div>
                <div className="chart-bar" style={{height: '90%'}}></div>
                <div className="chart-bar" style={{height: '70%'}}></div>
                <div className="chart-bar" style={{height: '85%'}}></div>
                <div className="chart-bar" style={{height: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
