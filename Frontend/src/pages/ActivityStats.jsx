import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Activity, Target, Moon, Plus, Save } from 'lucide-react';
import { apiFetch } from '../lib/api';
import './ActivityStats.css';

const ActivityStats = () => {
  const [timeFilter, setTimeFilter] = useState('30');
  const [summary, setSummary] = useState(null);
  const [showSleepInput, setShowSleepInput] = useState(false);
  const [newSleepScore, setNewSleepScore] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    quality: ''
  });

  const loadSummary = async (days) => {
    try {
      const data = await apiFetch(`/api/activity/summary?days=${days}`);
      setSummary(data);
    } catch (error) {
      setSummary(null);
    }
  };

  useEffect(() => {
    loadSummary(timeFilter);
  }, [timeFilter]);

  const handleSleepScoreSubmit = async (e) => {
    e.preventDefault();
    if (!newSleepScore.hours || !newSleepScore.quality) return;

    const calculatedScore = Math.round((parseFloat(newSleepScore.hours) / 8) * 50 + (parseInt(newSleepScore.quality, 10) / 10) * 50);

    await apiFetch('/api/activity', {
      method: 'POST',
      body: JSON.stringify({
        source: 'manual',
        sessionStartedAt: newSleepScore.date,
        sessionEndedAt: newSleepScore.date,
        mood: 'Neutral',
        activityLevel: 'Low',
        sleep: {
          hours: Number(newSleepScore.hours),
          quality: Number(newSleepScore.quality),
          score: Math.min(100, Math.max(0, calculatedScore))
        },
        notes: 'Sleep tracker entry'
      })
    });

    setNewSleepScore({ date: new Date().toISOString().split('T')[0], hours: '', quality: '' });
    setShowSleepInput(false);
    loadSummary(timeFilter);
  };

  const chartData = useMemo(() => {
    const workouts = summary?.trends?.weeklyWorkouts || [];
    const max = Math.max(...workouts, 1);
    return workouts.map((value) => ({ value, height: (value / max) * 100 }));
  }, [summary]);

  return (
    <div className="page-container stats-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Activity <span className="text-gradient">Statistics</span></h1>
            <p>All values are loaded from backend activity records.</p>
          </div>
          <div className="time-filter">
            <button className={timeFilter === '7' ? 'active' : ''} onClick={() => setTimeFilter('7')}>7d</button>
            <button className={timeFilter === '30' ? 'active' : ''} onClick={() => setTimeFilter('30')}>30d</button>
            <button className={timeFilter === '90' ? 'active' : ''} onClick={() => setTimeFilter('90')}>90d</button>
          </div>
        </div>

        <div className="stats-layout">
          <div className="stats-summary-grid">
            <div className="stat-card glass-card"><div className="stat-icon bg-blue"><Activity size={20} /></div><div className="stat-content"><span className="label">Total Sessions</span><span className="value">{summary?.totalSessions ?? 0}</span></div></div>
            <div className="stat-card glass-card"><div className="stat-icon bg-cyan"><Target size={20} /></div><div className="stat-content"><span className="label">Avg Fitness Score</span><span className="value">{summary?.avgFitnessScore ?? 0}</span></div></div>
            <div className="stat-card glass-card"><div className="stat-icon bg-purple"><TrendingUp size={20} /></div><div className="stat-content"><span className="label">Active Minutes</span><span className="value">{summary?.totalActiveMinutes ?? 0}</span></div></div>
            <div className="stat-card glass-card"><div className="stat-icon bg-green"><BarChart3 size={20} /></div><div className="stat-content"><span className="label">Consistency</span><span className="value">{summary?.consistency ?? 0}%</span></div></div>
          </div>

          <div className="sleep-score-section glass-card">
            <div className="sleep-score-header">
              <div>
                <h3><Moon size={24} /> Sleep Score Tracker</h3>
                <p>Stored in backend as manual activity entries</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowSleepInput(!showSleepInput)}>
                <Plus size={16} />
                {showSleepInput ? 'Cancel' : 'Add Entry'}
              </button>
            </div>

            {showSleepInput && (
              <form onSubmit={handleSleepScoreSubmit} className="sleep-input-form">
                <div className="sleep-input-group">
                  <label>Date</label>
                  <input type="date" value={newSleepScore.date} onChange={(e) => setNewSleepScore({ ...newSleepScore, date: e.target.value })} required />
                </div>
                <div className="sleep-input-group">
                  <label>Hours Slept</label>
                  <input type="number" step="0.5" min="0" max="24" value={newSleepScore.hours} onChange={(e) => setNewSleepScore({ ...newSleepScore, hours: e.target.value })} required />
                </div>
                <div className="sleep-input-group">
                  <label>Sleep Quality (1-10)</label>
                  <input type="number" min="1" max="10" value={newSleepScore.quality} onChange={(e) => setNewSleepScore({ ...newSleepScore, quality: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Save Sleep Score</button>
              </form>
            )}
          </div>

          <div className="chart-container glass-card">
            <div className="chart-header">
              <h3>Sessions Trend</h3>
              <span className="chart-value">{summary?.totalSessions ?? 0} total</span>
            </div>
            <div className="bar-chart">
              {chartData.map((item, idx) => (
                <div key={idx} className="bar-item">
                  <div className="bar-wrapper">
                    <div className="bar-fill" style={{ height: `${item.height}%` }}>
                      <span className="bar-value">{item.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
