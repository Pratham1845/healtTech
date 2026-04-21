import { BarChart3, TrendingUp, Activity, Target } from 'lucide-react';
import './ActivityStats.css';

const ActivityStats = () => {
  return (
    <div className="page-container stats-page">
      <div className="container">
        <div className="page-header">
          <h1>Activity <span className="text-gradient">Statistics</span></h1>
          <p>Deep dive into your health metrics and performance trends.</p>
        </div>

        <div className="stats-layout">
          {/* Summary Cards */}
          <div className="stats-summary-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon bg-blue"><Activity size={20} /></div>
              <div className="stat-content">
                <span className="label">Total Workouts</span>
                <span className="value">42</span>
                <span className="trend positive">+12% this month</span>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon bg-cyan"><Target size={20} /></div>
              <div className="stat-content">
                <span className="label">Avg Form Score</span>
                <span className="value">88%</span>
                <span className="trend positive">+3% this month</span>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon bg-purple"><TrendingUp size={20} /></div>
              <div className="stat-content">
                <span className="label">Active Minutes</span>
                <span className="value">1,240</span>
                <span className="trend negative">-5% this month</span>
              </div>
            </div>
          </div>

          {/* Large Charts */}
          <div className="charts-grid">
            <div className="chart-container glass-card span-2">
              <div className="chart-header">
                <h3>Workout Volume (Past 30 Days)</h3>
                <div className="chart-filters">
                  <button className="active">1M</button>
                  <button>3M</button>
                  <button>6M</button>
                </div>
              </div>
              <div className="chart-mockup large-chart">
                {/* CSS Bar Chart Mockup */}
                <div className="bar-group"><div className="bar h-40"></div></div>
                <div className="bar-group"><div className="bar h-60"></div></div>
                <div className="bar-group"><div className="bar h-80"></div></div>
                <div className="bar-group"><div className="bar h-30"></div></div>
                <div className="bar-group"><div className="bar h-90"></div></div>
                <div className="bar-group"><div className="bar h-50"></div></div>
                <div className="bar-group"><div className="bar h-70"></div></div>
                <div className="bar-group"><div className="bar h-100"></div></div>
                <div className="bar-group"><div className="bar h-40"></div></div>
                <div className="bar-group"><div className="bar h-80"></div></div>
              </div>
            </div>

            <div className="chart-container glass-card">
              <div className="chart-header">
                <h3>Postural Breakdown</h3>
              </div>
              <div className="pie-chart-mockup">
                <div className="pie-circle"></div>
                <div className="pie-legend">
                  <div className="legend-item"><span className="dot dot-1"></span> Perfect Form (65%)</div>
                  <div className="legend-item"><span className="dot dot-2"></span> Slight Deviance (25%)</div>
                  <div className="legend-item"><span className="dot dot-3"></span> High Risk (10%)</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
