import { TrendingUp, Activity, PieChart, AlertCircle, MessageCircle, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Your <span className="text-gradient">Dashboard</span></h1>
          <p>Welcome back, Alex. Here is your overview for today.</p>
        </div>

        <div className="dashboard-grid glass-card">
          {/* Dashboard Header */}
          <div className="dash-header">
            <div className="user-greeting">
              <h3>Health Status</h3>
              <p>Your health score improved by 4% this week.</p>
            </div>
            <div className="date-filter">
              <span>This Week</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="quick-actions-panel">
            <Link to="/workout" className="quick-action-card">
              <Activity size={24} className="text-accent" />
              <span>Start Workout</span>
            </Link>
            <Link to="/chatbot" className="quick-action-card">
              <MessageCircle size={24} className="text-accent" />
              <span>AI Coach</span>
            </Link>
            <Link to="/stats" className="quick-action-card">
              <PieChart size={24} className="text-accent" />
              <span>View Stats</span>
            </Link>
            <Link to="/history" className="quick-action-card">
              <History size={24} className="text-accent" />
              <span>History</span>
            </Link>
          </div>

          {/* Dashboard Grid */}
          <div className="dash-widgets">
            
            {/* Health Score Ring */}
            <div className="dash-widget widget-score">
              <h4>Overall Health Score</h4>
              <div className="score-ring-container">
                <svg className="score-ring" viewBox="0 0 100 100">
                  <circle className="ring-bg" cx="50" cy="50" r="40"></circle>
                  <circle className="ring-progress" cx="50" cy="50" r="40" strokeDasharray="251" strokeDashoffset="40"></circle>
                </svg>
                <div className="score-value">
                  <span className="num">84</span>
                  <span className="label">Good</span>
                </div>
              </div>
            </div>

            {/* Weekly Activity Graph */}
            <div className="dash-widget widget-activity">
              <div className="widget-header">
                <h4>Weekly Activity</h4>
                <TrendingUp size={16} className="text-accent" />
              </div>
              <div className="chart-mockup">
                <div className="bar-group"><div className="bar h-40"></div><span>M</span></div>
                <div className="bar-group"><div className="bar h-60"></div><span>T</span></div>
                <div className="bar-group"><div className="bar h-80"></div><span>W</span></div>
                <div className="bar-group"><div className="bar h-30"></div><span>T</span></div>
                <div className="bar-group"><div className="bar h-90"></div><span>F</span></div>
                <div className="bar-group"><div className="bar h-50"></div><span>S</span></div>
                <div className="bar-group"><div className="bar h-70"></div><span>S</span></div>
              </div>
            </div>

            {/* Mood Trend */}
            <div className="dash-widget widget-mood">
              <div className="widget-header">
                <h4>Mood Trend</h4>
                <Activity size={16} className="text-accent" />
              </div>
              <div className="wave-chart">
                <svg viewBox="0 0 200 50" preserveAspectRatio="none">
                  <path d="M0,25 C30,10 70,40 100,25 C130,10 170,30 200,20 L200,50 L0,50 Z" fill="url(#dash-gradient-purple)"></path>
                  <path d="M0,25 C30,10 70,40 100,25 C130,10 170,30 200,20" fill="none" stroke="var(--accent-purple)" strokeWidth="2"></path>
                  <defs>
                    <linearGradient id="dash-gradient-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="mood-stats">
                <div className="stat"><span>Calm</span> 65%</div>
                <div className="stat"><span>Stressed</span> 10%</div>
              </div>
            </div>

            {/* Recommendations Feed */}
            <div className="dash-widget widget-feed">
              <h4>Smart Recommendations</h4>
              <ul className="feed-list">
                <li>
                  <div className="feed-icon warning"><AlertCircle size={14} /></div>
                  <div className="feed-text">
                    <strong>Posture Alert</strong>
                    <span>Prolonged slouching detected yesterday. Try the 5-min neck stretch.</span>
                  </div>
                </li>
                <li>
                  <div className="feed-icon info"><PieChart size={14} /></div>
                  <div className="feed-text">
                    <strong>Routine Optimized</strong>
                    <span>Increased lower body volume by 10% based on recent recovery data.</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
