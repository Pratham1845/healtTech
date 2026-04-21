import { useState } from 'react';
import { BarChart3, TrendingUp, Activity, Target, Calendar, ChevronDown } from 'lucide-react';
import './ActivityStats.css';

const ActivityStats = () => {
  const [timeFilter, setTimeFilter] = useState('30d');

  const dummyData = {
    totalWorkouts: 42,
    avgFormScore: 88,
    activeMinutes: 1240,
    consistency: 85,
    weeklyWorkouts: [5, 7, 6, 8, 7, 9, 6, 8, 7, 5, 8, 9],
    moodTrend: [75, 80, 72, 85, 90, 88, 92],
    healthScoreTrend: [78, 80, 82, 81, 84, 85, 87],
    caloriesTrend: [320, 450, 380, 520, 410, 490, 430],
    postureBreakdown: { perfect: 65, slight: 25, risk: 10 }
  };

  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

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

          {/* Large Charts */}
          <div className="charts-grid">
            <div className="chart-container glass-card span-2">
              <div className="chart-header">
                <h3>Workout Volume (Past {timeFilter})</h3>
              </div>
              <div className="chart-mockup large-chart">
                {dummyData.weeklyWorkouts.map((value, idx) => (
                  <div key={idx} className="bar-group">
                    <div className="bar" style={{ height: `${value * 10}%` }}></div>
                    {timeFilter === '30d' && <span>{daysLabels[idx]}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Postural Breakdown</h3>
              </div>
              <div className="pie-chart-mockup">
                <div className="pie-circle"></div>
                <div className="pie-legend">
                  <div className="legend-item">
                    <span className="dot dot-1"></span>
                    Perfect Form ({dummyData.postureBreakdown.perfect}%)
                  </div>
                  <div className="legend-item">
                    <span className="dot dot-2"></span>
                    Slight Deviance ({dummyData.postureBreakdown.slight}%)
                  </div>
                  <div className="legend-item">
                    <span className="dot dot-3"></span>
                    High Risk ({dummyData.postureBreakdown.risk}%)
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Health Score Trend</h3>
              </div>
              <div className="line-chart-mockup">
                <svg viewBox="0 0 200 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,50 Q30,45 60,40 T120,30 T200,20 L200,80 L0,80 Z" 
                    fill="url(#healthGradient)" 
                  />
                  <path 
                    d="M0,50 Q30,45 60,40 T120,30 T200,20" 
                    fill="none" 
                    stroke="var(--accent-cyan)" 
                    strokeWidth="2"
                  />
                </svg>
                <div className="chart-labels">
                  <span>78</span>
                  <span>87</span>
                </div>
              </div>
            </div>

            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Mood Trend</h3>
              </div>
              <div className="line-chart-mockup">
                <svg viewBox="0 0 200 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,60 Q30,50 60,55 T120,40 T200,25 L200,80 L0,80 Z" 
                    fill="url(#moodGradient)" 
                  />
                  <path 
                    d="M0,60 Q30,50 60,55 T120,40 T200,25" 
                    fill="none" 
                    stroke="var(--accent-purple)" 
                    strokeWidth="2"
                  />
                </svg>
                <div className="chart-labels">
                  <span>72</span>
                  <span>92</span>
                </div>
              </div>
            </div>

            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Calories Burned</h3>
              </div>
              <div className="chart-mockup">
                {dummyData.caloriesTrend.map((value, idx) => (
                  <div key={idx} className="bar-group">
                    <div className="bar" style={{ height: `${(value / 520) * 100}%` }}></div>
                    <span>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
