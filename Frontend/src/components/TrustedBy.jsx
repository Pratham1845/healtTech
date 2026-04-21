import { useEffect, useState } from 'react';
import './TrustedBy.css';

const TrustedBy = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simple intersection observer to trigger counter animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    
    const element = document.getElementById('trust-metrics');
    if (element) observer.observe(element);
    
    return () => observer.disconnect();
  }, []);

  const stats = [
    { label: 'Sessions Analyzed', value: '10K+', suffix: '' },
    { label: 'User Satisfaction', value: '95', suffix: '%' },
    { label: 'Real-Time AI Feedback', value: '100', suffix: '%' },
    { label: 'Hardware Required', value: 'Zero', suffix: '' }
  ];

  return (
    <section className="trusted-by" id="trust-metrics">
      <div className="container">
        <div className="metrics-strip glass-card">
          {stats.map((stat, index) => (
            <div key={index} className="metric-item">
              <h3 className="metric-value text-gradient">
                <span className={isVisible ? 'animate-count' : ''}>{stat.value}</span>
                {stat.suffix}
              </h3>
              <p className="metric-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
