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
            <p>Database-backed overview of your current health activity.</p>
          </div>
          <div className="date-filter-btn">
            <span>Last 7 Days</span>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard icon={Heart} label="Health Score" value={summary?.avgFitnessScore ?? 0} trend="From recorded sessions" trendType="positive" />
          <StatCard icon={Activity} label="Mood Status" value={summary?.moodStatus ?? 'Neutral'} trend="Latest detected state" trendType="positive" />
          <StatCard icon={AlertCircle} label="Risk Level" value={summary?.riskLevel ?? 'Low'} trend="Computed from posture" trendType="positive" />
          <StatCard icon={Zap} label="Today's Activity" value={`${summary?.totalActiveMinutes ?? 0} min`} trend={`${summary?.totalSessions ?? 0} sessions`} trendType="positive" />
        </div>

        <div className="dashboard-main-grid">
          <div className="chart-card glass-card">
            <div className="card-header">
              <h3>Weekly Activity</h3>
              <span className="chart-subtitle">Total Sessions: {summary?.totalSessions ?? 0}</span>
            </div>
            <div className="bar-chart-simple">
              {weekWorkouts.map((minutes, idx) => {
                const max = Math.max(...weekWorkouts, 1);
                const heightPercent = (minutes / max) * 100;
                const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx] || `D${idx + 1}`;
                return (
                  <div key={idx} className="bar-item-simple">
                    <div className="bar-value-label">{minutes > 0 ? `${minutes}` : ''}</div>
                    <div className="bar-wrapper-simple">
                      <div className="bar-fill-simple" style={{ height: `${heightPercent}%` }}></div>
                    </div>
                    <span className="bar-label-simple">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mood-card glass-card">
            <div className="card-header">
              <h3>Mood / Posture Trend</h3>
              <span className="chart-subtitle">Live history</span>
            </div>
            <div className="mood-linear-chart">
              <div className="mood-data-points">
                {moodTrend.map((value, idx) => (
                  <div key={idx} className="mood-point">
                    <div className="mood-circle" style={{ bottom: `${Math.max(8, Math.min(95, value))}%` }}>
                      <span>{value}</span>
                    </div>
                    <span className="mood-day-label">D{idx + 1}</span>
                  </div>
                ))}
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
                  <strong>Consistency</strong>
                  <span>Current consistency is {summary?.consistency ?? 0}%. Aim for one short session each day.</span>
                </div>
              </div>
              <div className="recommendation-item success">
                <div className="rec-icon"><TrendingUp size={18} /></div>
                <div className="rec-content">
                  <strong>Progress Trend</strong>
                  <span>Your average fitness score is {summary?.avgFitnessScore ?? 0}. Keep progressive overload controlled.</span>
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
