import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Activity, PieChart, AlertCircle, MessageCircle, History, Zap, Heart, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { apiFetch } from '../lib/api';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/api/activity/summary?days=7');
        setSummary(data);
      } catch (error) {
        setSummary(null);
      }
    };

    load();
  }, []);

  const weekWorkouts = useMemo(() => {
    const values = summary?.trends?.weeklyWorkouts || [];
    if (values.length) return values;
    return [0, 0, 0, 0, 0, 0, 0];
  }, [summary]);

  const moodTrend = useMemo(() => {
    const values = summary?.trends?.moodTrend || [];
    if (values.length) return values.slice(-7);
    return [0, 0, 0, 0, 0, 0, 0];
  }, [summary]);

  return (
    <div className="page-container dashboard-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Your <span className="text-gradient">Dashboard</span></h1>
            <p>Database-backed overview from workout, sleep, and emotion sessions.</p>
          </div>
          <div className="date-filter-btn">
            <span>Last 7 Days</span>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={Heart}
            label="Health Score"
            value={summary?.latestHealthScore ?? 0}
            trend={`Avg: ${summary?.avgHealthScore ?? 0}`}
            trendType="positive"
          />
          <StatCard
            icon={Activity}
            label="Mood Status"
            value={summary?.moodStatus ?? 'Neutral'}
            trend="Latest detected state"
            trendType="positive"
          />
          <StatCard
            icon={AlertCircle}
            label="Risk Level"
            value={summary?.riskLevel ?? 'Low'}
            trend="Computed from posture + sleep + emotion"
            trendType="positive"
          />
          <StatCard
            icon={Zap}
            label="Today's Activity"
            value={`${summary?.totalActiveMinutes ?? 0} min`}
            trend={`${summary?.totalSessions ?? 0} sessions`}
            trendType="positive"
          />
        </div>

        <div className="dashboard-main-grid">
          <div className="chart-card glass-card">
            <div className="card-header">
              <h3>Weekly Activity</h3>
              <span className="chart-subtitle">Total Sessions: {summary?.totalSessions ?? 0}</span>
            </div>
            <div className="bar-chart-container">
              <div className="bar-chart-grid">
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
              </div>
              <div className="bar-chart-simple">
                {weekWorkouts.map((workouts, idx) => {
                  const max = Math.max(...weekWorkouts, 3);
                  const heightPercent = (workouts / max) * 100;
                  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx] || `D${idx + 1}`;
                  return (
                    <div key={idx} className="bar-item-simple">
                      <div className="bar-wrapper-simple">
                        <div className="bar-fill-simple" style={{ height: `${heightPercent}%` }}>
                          <div className="bar-tooltip">
                            {workouts > 0 ? `${workouts} session${workouts !== 1 ? 's' : ''}` : 'No activity'}
                          </div>
                        </div>
                      </div>
                      <span className="bar-label-simple">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mood-card glass-card">
            <div className="card-header">
              <h3>Mood / Emotion Trend</h3>
              <span className="chart-subtitle">Live history</span>
            </div>
            <div className="mood-linear-chart">
              <svg className="mood-line-svg" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--accent-purple)" />
                    <stop offset="50%" stopColor="var(--accent-blue)" />
                    <stop offset="100%" stopColor="var(--accent-cyan)" />
                  </linearGradient>
                </defs>
                <path 
                  d={`M ${moodTrend.map((v, i) => `${(i / Math.max(1, moodTrend.length - 1)) * 100},${100 - Math.max(8, Math.min(95, v))}`).join(' L ')}`}
                  fill="none" 
                  stroke="url(#moodGradient)" 
                  strokeWidth="3" 
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mood-data-points">
                {moodTrend.map((value, idx) => {
                  const yPos = Math.max(8, Math.min(95, value));
                  let emoji = '😐';
                  let color = '#94a3b8';
                  
                  if (value >= 85) { emoji = '😊'; color = '#22c55e'; }
                  else if (value >= 70) { emoji = '😐'; color = '#3b82f6'; }
                  else if (value >= 55) { emoji = '😢'; color = '#f59e0b'; }
                  else if (value > 0) { emoji = '😠'; color = '#ef4444'; }
                  else { emoji = '➖'; color = '#475569'; }

                  return (
                    <div key={idx} className="mood-point">
                      <div 
                        className="mood-circle" 
                        style={{ 
                          bottom: `${yPos}%`,
                          backgroundColor: color,
                          boxShadow: `0 4px 12px ${color}66`
                        }}
                      >
                        <span className="mood-emoji">{emoji}</span>
                        <div className="mood-tooltip">Score: {value > 0 ? value : 'N/A'}</div>
                      </div>
                      <span className="mood-day-label">D{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-bottom-grid">
          <div className="actions-card glass-card">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/workout" className="action-btn"><Activity size={24} /><span>Start Workout</span></Link>
              <Link to="/chatbot" className="action-btn"><MessageCircle size={24} /><span>AI Coach</span></Link>
              <Link to="/stats" className="action-btn"><PieChart size={24} /><span>View Analytics</span></Link>
              <Link to="/history" className="action-btn"><History size={24} /><span>Session History</span></Link>
            </div>
          </div>

          <div className="recommendations-card glass-card">
            <div className="card-header">
              <h3>Smart Recommendations</h3>
              <Target size={20} className="text-accent" />
            </div>
            <div className="recommendations-list">
              <div className="recommendation-item warning">
                <div className="rec-icon"><AlertCircle size={18} /></div>
                <div className="rec-content">
                  <strong>Recovery Focus</strong>
                  <span>Sleep score is {summary?.avgSleepScore ?? '--'}. Prioritize recovery if below 70.</span>
                </div>
              </div>
              <div className="recommendation-item success">
                <div className="rec-icon"><TrendingUp size={18} /></div>
                <div className="rec-content">
                  <strong>Progress Trend</strong>
                  <span>Average health score is {summary?.avgHealthScore ?? 0}. Keep sessions consistent.</span>
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
