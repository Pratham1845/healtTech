import { Play, ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="container hero-container split-layout">
        
        {/* Left Side: Content */}
        <div className="hero-content animate-fade-up">
          <h1 className="hero-title">
            Reach Your <span className="text-gradient">Peak Health</span>
          </h1>
          <p className="hero-subtitle">
            AI-powered posture, mood, and wellness monitoring.
          </p>
          <p className="hero-support-text">
            No wearables. No expensive devices. Real-time intelligent health insights using just your camera.
          </p>
          
        </div>

        {/* Right Side: Minimalist Visual */}
        <div className="hero-visual">
          <div className="minimal-grid">
            <div className="holo-stat stat-tl glass-card">
              <span className="stat-label">Health Score</span>
              <span className="stat-value text-gradient">94</span>
            </div>
            
            <div className="holo-stat stat-tr glass-card">
              <span className="stat-label">Mood</span>
              <span className="stat-value text-gradient">Calm</span>
            </div>
            
            <div className="holo-stat stat-bl glass-card">
              <span className="stat-label">Form</span>
              <span className="stat-value text-gradient">98%</span>
            </div>

            <div className="holo-stat stat-br glass-card">
              <span className="stat-label">Risk Level</span>
              <span className="stat-value text-gradient">Low</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
