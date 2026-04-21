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
              <TrendingUp size={20} className="text-accent" />
            </div>
            <div className="bar-chart">
              {[
                { day: 'Mon', height: 60 },
                { day: 'Tue', height: 80 },
                { day: 'Wed', height: 45 },
                { day: 'Thu', height: 90 },
                { day: 'Fri', height: 70 },
                { day: 'Sat', height: 85 },
                { day: 'Sun', height: 40 }
              ].map((item, idx) => (
                <div key={idx} className="bar-item">
                  <div 
                    className="bar-fill" 
                    style={{ height: `${item.height}%` }}
                  ></div>
                  <span className="bar-label">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Trend */}
          <div className="mood-card glass-card">
            <div className="card-header">
              <h3>Mood Trend</h3>
              <Activity size={20} className="text-accent" />
            </div>
            <div className="wave-chart">
              <svg viewBox="0 0 200 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,30 Q25,10 50,25 T100,20 T150,35 T200,25 L200,60 L0,60 Z" 
                  fill="url(#moodGradient)" 
                />
                <path 
                  d="M0,30 Q25,10 50,25 T100,20 T150,35 T200,25" 
                  fill="none" 
                  stroke="var(--accent-purple)" 
                  strokeWidth="2"
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
