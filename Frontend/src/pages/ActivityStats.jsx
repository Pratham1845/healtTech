import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Target, Calendar, ChevronDown, Moon, Plus, Save } from 'lucide-react';
import './ActivityStats.css';

const ActivityStats = () => {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [sleepScores, setSleepScores] = useState(() => {
    const saved = localStorage.getItem('sleepScores');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSleepInput, setShowSleepInput] = useState(false);
  const [newSleepScore, setNewSleepScore] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    quality: ''
  });

  const dummyData = {
    totalWorkouts: 42,
    avgFormScore: 88,
    activeMinutes: 1240,
    consistency: 85,
    weeklyWorkouts: {
      '7d': [5, 7, 6, 8, 7, 9, 6],
      '30d': [5, 7, 6, 8, 7, 9, 6, 8, 7, 5, 8, 9, 7, 6, 8, 5, 7, 9, 8, 6, 7, 8, 9, 5, 6, 7, 8, 7, 9, 8],
      '90d': Array.from({ length: 90 }, () => Math.floor(Math.random() * 5) + 5)
    },
    moodTrend: {
      '7d': [75, 80, 72, 85, 90, 88, 92],
      '30d': [70, 75, 80, 72, 85, 90, 88, 92, 85, 80, 78, 82, 88, 90, 85, 83, 87, 91, 89, 86, 84, 88, 92, 90, 87, 85, 83, 86, 89, 91],
      '90d': Array.from({ length: 90 }, () => Math.floor(Math.random() * 25) + 70)
    },
    healthScoreTrend: {
      '7d': [78, 80, 82, 81, 84, 85, 87],
      '30d': [75, 76, 78, 80, 82, 81, 84, 85, 87, 86, 84, 83, 85, 87, 88, 86, 85, 87, 89, 88, 87, 86, 88, 90, 89, 88, 87, 89, 90, 91],
      '90d': Array.from({ length: 90 }, () => Math.floor(Math.random() * 20) + 75)
    },
    caloriesTrend: {
      '7d': [320, 450, 380, 520, 410, 490, 430],
      '30d': [320, 450, 380, 520, 410, 490, 430, 380, 420, 460, 510, 390, 440, 470, 500, 410, 430, 480, 450, 420, 460, 490, 510, 440, 400, 430, 470, 450, 480, 460],
      '90d': Array.from({ length: 90 }, () => Math.floor(Math.random() * 250) + 300)
    },
    postureBreakdown: { perfect: 65, slight: 25, risk: 10 }
  };

  const getDaysLabels = (filter) => {
    if (filter === '7d') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (filter === '30d') return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    return Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`);
  };

  const currentWorkouts = dummyData.weeklyWorkouts[timeFilter];
  const currentMood = dummyData.moodTrend[timeFilter];
  const currentHealth = dummyData.healthScoreTrend[timeFilter];
  const currentCalories = dummyData.caloriesTrend[timeFilter];
  const daysLabels = getDaysLabels(timeFilter);

  // Save sleep scores to localStorage
  useEffect(() => {
    localStorage.setItem('sleepScores', JSON.stringify(sleepScores));
  }, [sleepScores]);

  const handleSleepScoreSubmit = (e) => {
    e.preventDefault();
    if (!newSleepScore.hours || !newSleepScore.quality) return;

    const calculatedScore = Math.round(
      (parseFloat(newSleepScore.hours) / 8) * 50 + 
      (parseInt(newSleepScore.quality) / 10) * 50
    );

    const scoreEntry = {
      ...newSleepScore,
      score: Math.min(100, Math.max(0, calculatedScore)),
      id: Date.now()
    };

    setSleepScores(prev => [scoreEntry, ...prev].slice(0, 30)); // Keep last 30 entries
    setNewSleepScore({
      date: new Date().toISOString().split('T')[0],
      hours: '',
      quality: ''
    });
    setShowSleepInput(false);
  };

  // Helper to create SVG path from data
  const createLinePath = (data, width = 600, height = 200) => {
    if (data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const padding = 10;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  };

  const createAreaPath = (data, width = 600, height = 200) => {
    const linePath = createLinePath(data, width, height);
    return `${linePath} L${width - 10},${height} L10,${height} Z`;
  };

  return (
    <div className="page-container stats-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Activity <span className="text-gradient">Statistics</span></h1>
            <p>Deep dive into your health metrics and performance trends.</p>
          </div>
          <div className="time-filter">
            <button 
              className={timeFilter === '7d' ? 'active' : ''}
              onClick={() => setTimeFilter('7d')}
            >
              7d
            </button>
            <button 
              className={timeFilter === '30d' ? 'active' : ''}
              onClick={() => setTimeFilter('30d')}
            >
              30d
            </button>
            <button 
              className={timeFilter === '90d' ? 'active' : ''}
              onClick={() => setTimeFilter('90d')}
            >
              90d
            </button>
          </div>
        </div>

        <div className="stats-layout">
          {/* Summary Cards */}
          <div className="stats-summary-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon bg-blue"><Activity size={20} /></div>
              <div className="stat-content">
                <span className="label">Total Workouts</span>
                <span className="value">{dummyData.totalWorkouts}</span>
                <span className="trend positive">+12% this month</span>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon bg-cyan"><Target size={20} /></div>
              <div className="stat-content">
                <span className="label">Avg Form Score</span>
                <span className="value">{dummyData.avgFormScore}%</span>
                <span className="trend positive">+3% this month</span>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon bg-purple"><TrendingUp size={20} /></div>
              <div className="stat-content">
                <span className="label">Active Minutes</span>
                <span className="value">{dummyData.activeMinutes.toLocaleString()}</span>
                <span className="trend negative">-5% this month</span>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon bg-green"><Calendar size={20} /></div>
              <div className="stat-content">
                <span className="label">Consistency</span>
                <span className="value">{dummyData.consistency}%</span>
                <span className="trend positive">+8% this month</span>
              </div>
            </div>
          </div>

          {/* Sleep Score Section */}
          <div className="sleep-score-section glass-card">
            <div className="sleep-score-header">
              <div>
                <h3><Moon size={24} /> Sleep Score Tracker</h3>
                <p>Track your sleep patterns and quality</p>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowSleepInput(!showSleepInput)}
              >
                <Plus size={16} />
                {showSleepInput ? 'Cancel' : 'Add Entry'}
              </button>
            </div>

            {showSleepInput && (
              <form onSubmit={handleSleepScoreSubmit} className="sleep-input-form">
                <div className="sleep-input-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={newSleepScore.date}
                    onChange={(e) => setNewSleepScore({...newSleepScore, date: e.target.value})}
                    required
                  />
                </div>
                <div className="sleep-input-group">
                  <label>Hours Slept</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="7.5"
                    value={newSleepScore.hours}
                    onChange={(e) => setNewSleepScore({...newSleepScore, hours: e.target.value})}
                    required
                  />
                </div>
                <div className="sleep-input-group">
                  <label>Sleep Quality (1-10)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    placeholder="8"
                    value={newSleepScore.quality}
                    onChange={(e) => setNewSleepScore({...newSleepScore, quality: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  Save Sleep Score
                </button>
              </form>
            )}

            {sleepScores.length > 0 && (
              <div className="sleep-scores-list">
                <div className="sleep-stats">
                  <div className="sleep-stat-item">
                    <span className="sleep-stat-label">Average Score</span>
                    <span className="sleep-stat-value">
                      {Math.round(sleepScores.reduce((sum, s) => sum + s.score, 0) / sleepScores.length)}
                    </span>
                  </div>
                  <div className="sleep-stat-item">
                    <span className="sleep-stat-label">Avg Hours</span>
                    <span className="sleep-stat-value">
                      {(sleepScores.reduce((sum, s) => sum + parseFloat(s.hours), 0) / sleepScores.length).toFixed(1)}h
                    </span>
                  </div>
                  <div className="sleep-stat-item">
                    <span className="sleep-stat-label">Total Entries</span>
                    <span className="sleep-stat-value">{sleepScores.length}</span>
                  </div>
                </div>
                <div className="sleep-entries">
                  {sleepScores.slice(0, 7).map((entry) => (
                    <div key={entry.id} className="sleep-entry-item">
                      <div className="sleep-entry-date">
                        <span>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="sleep-entry-details">
                        <span>{entry.hours}h</span>
                        <div className="sleep-score-bar">
                          <div 
                            className="sleep-score-fill"
                            style={{ 
                              width: `${entry.score}%`,
                              backgroundColor: entry.score >= 80 ? 'var(--accent-success)' : 
                                               entry.score >= 60 ? 'var(--accent-cyan)' : 'var(--accent-warning)'
                            }}
                          ></div>
                        </div>
                        <span className="sleep-score-value">{entry.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sleepScores.length === 0 && !showSleepInput && (
              <div className="sleep-empty-state">
                <Moon size={48} />
                <p>No sleep data yet. Add your first entry to start tracking!</p>
              </div>
            )}
          </div>

          {/* Large Charts */}
          <div className="charts-grid">
            {/* Workout Volume Chart */}
            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Workout Volume (Past {timeFilter})</h3>
                <span className="chart-value">{currentWorkouts.reduce((a, b) => a + b, 0)} sessions</span>
              </div>
              <div className="bar-chart">
                {currentWorkouts.map((value, idx) => {
                  const maxValue = Math.max(...currentWorkouts);
                  const heightPercent = (value / maxValue) * 100;
                  return (
                    <div key={idx} className="bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar-fill" 
                          style={{ height: `${heightPercent}%` }}
                        >
                          <span className="bar-value">{value}</span>
                        </div>
                      </div>
                      {timeFilter === '7d' && <span className="bar-label">{daysLabels[idx]}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Postural Breakdown */}
            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Postural Breakdown</h3>
              </div>
              <div className="pie-chart-mockup">
                <div className="pie-circle"></div>
                <div className="pie-legend">
                  <div className="legend-item">
                    <span className="dot dot-1"></span>
                    <span>Perfect Form</span>
                    <span className="legend-value">{dummyData.postureBreakdown.perfect}%</span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot-2"></span>
                    <span>Slight Deviance</span>
                    <span className="legend-value">{dummyData.postureBreakdown.slight}%</span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot-3"></span>
                    <span>High Risk</span>
                    <span className="legend-value">{dummyData.postureBreakdown.risk}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score Trend */}
            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Health Score Trend</h3>
                <span className="chart-value">
                  <span className="trend-indicator positive">↑</span> 
                  {currentHealth[currentHealth.length - 1]}
                </span>
              </div>
              <div className="line-chart">
                <svg viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d={createAreaPath(currentHealth, 600, 200)} 
                    fill="url(#healthGradient)" 
                  />
                  <path 
                    d={createLinePath(currentHealth, 600, 200)} 
                    fill="none" 
                    stroke="var(--accent-cyan)" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="chart-axis-labels">
                  <span>{Math.min(...currentHealth)}</span>
                  <span>{Math.max(...currentHealth)}</span>
                </div>
              </div>
            </div>

            {/* Mood Trend */}
            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Mood Trend</h3>
                <span className="chart-value">
                  <span className="trend-indicator positive">↑</span> 
                  {currentMood[currentMood.length - 1]}%
                </span>
              </div>
              <div className="line-chart">
                <svg viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d={createAreaPath(currentMood, 600, 200)} 
                    fill="url(#moodGradient)" 
                  />
                  <path 
                    d={createLinePath(currentMood, 600, 200)} 
                    fill="none" 
                    stroke="var(--accent-purple)" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="chart-axis-labels">
                  <span>{Math.min(...currentMood)}%</span>
                  <span>{Math.max(...currentMood)}%</span>
                </div>
              </div>
            </div>

            {/* Calories Burned */}
            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Calories Burned</h3>
                <span className="chart-value">{currentCalories.reduce((a, b) => a + b, 0).toLocaleString()} cal</span>
              </div>
              <div className="bar-chart">
                {currentCalories.slice(0, timeFilter === '7d' ? 7 : 14).map((value, idx) => {
                  const maxValue = Math.max(...currentCalories);
                  const heightPercent = (value / maxValue) * 100;
                  return (
                    <div key={idx} className="bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar-fill calories" 
                          style={{ height: `${heightPercent}%` }}
                        >
                          <span className="bar-value">{value}</span>
                        </div>
                      </div>
                      {timeFilter === '7d' && <span className="bar-label">{daysLabels[idx]}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
