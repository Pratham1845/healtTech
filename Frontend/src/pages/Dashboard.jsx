import { TrendingUp, Activity, PieChart, AlertCircle, MessageCircle, History, Zap, Heart, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="page-container dashboard-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Your <span className="text-gradient">Dashboard</span></h1>
            <p>Welcome back, Alex. Here's your health overview for today.</p>
          </div>
          <div className="date-filter-btn">
            <span>This Week</span>
          </div>
        </div>

        {/* Top Row - Quick Stats */}
        <div className="stats-grid">
          <StatCard 
            icon={Heart}
            label="Health Score"
            value="84"
            trend="+4% this week"
            trendType="positive"
          />
          <StatCard 
            icon={Activity}
            label="Mood Status"
            value="Focused"
            trend="Calm & Productive"
            trendType="positive"
          />
          <StatCard 
            icon={AlertCircle}
            label="Risk Level"
            value="Low"
            trend="No concerns"
            trendType="positive"
          />
          <StatCard 
            icon={Zap}
            label="Today's Activity"
            value="45 min"
            trend="3 workouts this week"
            trendType="positive"
          />
        </div>

        {/* Second Row - Charts & Insights */}
        <div className="dashboard-main-grid">
          {/* Weekly Activity Chart */}
          <div className="chart-card glass-card">
            <div className="card-header">
              <h3>Weekly Activity</h3>
              <span className="chart-subtitle">Total: 3.5 hours</span>
            </div>
            <div className="bar-chart-simple">
              {[
                { day: 'Mon', minutes: 35 },
                { day: 'Tue', minutes: 45 },
                { day: 'Wed', minutes: 0 },
                { day: 'Thu', minutes: 50 },
                { day: 'Fri', minutes: 40 },
                { day: 'Sat', minutes: 60 },
                { day: 'Sun', minutes: 20 }
              ].map((item, idx) => {
                const maxMinutes = 60;
                const heightPercent = (item.minutes / maxMinutes) * 100;
                return (
                  <div key={idx} className="bar-item-simple">
                    <div className="bar-value-label">{item.minutes > 0 ? `${item.minutes}m` : ''}</div>
                    <div className="bar-wrapper-simple">
                      <div 
                        className="bar-fill-simple" 
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                    <span className="bar-label-simple">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mood Trend - Linear Format */}
          <div className="mood-card glass-card">
            <div className="card-header">
              <h3>Mood Trend</h3>
              <span className="chart-subtitle">This Week</span>
            </div>
            <div className="mood-linear-chart">
              <div className="mood-data-points">
                {[
                  { day: 'Mon', mood: 75 },
                  { day: 'Tue', mood: 82 },
                  { day: 'Wed', mood: 68 },
                  { day: 'Thu', mood: 85 },
                  { day: 'Fri', mood: 78 },
                  { day: 'Sat', mood: 90 },
                  { day: 'Sun', mood: 88 }
                ].map((item, idx) => (
                  <div key={idx} className="mood-point">
                    <div className="mood-circle" style={{ 
                      bottom: `${item.mood}%`,
                      background: item.mood >= 80 ? 'var(--accent-success)' : 
                                  item.mood >= 70 ? 'var(--accent-cyan)' : 'var(--accent-warning)'
                    }}>
                      <span>{item.mood}</span>
                    </div>
                    <span className="mood-day-label">{item.day}</span>
                  </div>
                ))}
              </div>
              <svg className="mood-line-svg" viewBox="0 0 300 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="moodLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="var(--accent-success)" />
                  </linearGradient>
                </defs>
                <path 
                  d="M21,22 L64,13 L107,28 L150,10 L193,17 L236,5 L279,8" 
                  fill="none" 
                  stroke="url(#moodLineGradient)" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mood-breakdown">
              <div className="mood-item">
                <span className="mood-label">Calm</span>
                <span className="mood-value">65%</span>
              </div>
              <div className="mood-item">
                <span className="mood-label">Focused</span>
                <span className="mood-value">25%</span>
              </div>
              <div className="mood-item">
                <span className="mood-label">Stressed</span>
                <span className="mood-value">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row - Quick Actions & Recommendations */}
        <div className="dashboard-bottom-grid">
          {/* Quick Actions */}
          <div className="actions-card glass-card">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/workout" className="action-btn">
                <Activity size={24} />
                <span>Start Workout</span>
              </Link>
              <Link to="/chatbot" className="action-btn">
                <MessageCircle size={24} />
                <span>AI Coach</span>
              </Link>
              <Link to="/stats" className="action-btn">
                <PieChart size={24} />
                <span>View Analytics</span>
              </Link>
              <Link to="/history" className="action-btn">
                <History size={24} />
                <span>Session History</span>
              </Link>
            </div>
          </div>

          {/* Smart Recommendations */}
          <div className="recommendations-card glass-card">
            <div className="card-header">
              <h3>Smart Recommendations</h3>
              <Target size={20} className="text-accent" />
            </div>
            <div className="recommendations-list">
              <div className="recommendation-item warning">
                <div className="rec-icon">
                  <AlertCircle size={18} />
                </div>
                <div className="rec-content">
                  <strong>Posture Alert</strong>
                  <span>Prolonged slouching detected. Try the 5-min neck stretch routine.</span>
                </div>
              </div>
              <div className="recommendation-item success">
                <div className="rec-icon">
                  <TrendingUp size={18} />
                </div>
                <div className="rec-content">
                  <strong>Routine Optimized</strong>
                  <span>Increased lower body volume by 10% based on recovery data.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
