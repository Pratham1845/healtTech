import { Calendar, Clock, Activity, Filter } from 'lucide-react';
import './History.css';

const History = () => {
  const sessions = [
    { id: 1, date: 'Today, 8:00 AM', type: 'Full Body HIIT', duration: '45 min', score: 92 },
    { id: 2, date: 'Yesterday, 6:30 PM', type: 'Mobility & Stretching', duration: '20 min', score: 98 },
    { id: 3, date: 'Oct 12, 7:15 AM', type: 'Lower Body Strength', duration: '55 min', score: 85 },
    { id: 4, date: 'Oct 10, 5:00 PM', type: 'Yoga Flow', duration: '30 min', score: 95 },
    { id: 5, date: 'Oct 8, 8:00 AM', type: 'Upper Body Strength', duration: '40 min', score: 88 },
  ];

  return (
    <div className="page-container history-page">
      <div className="container">
        <div className="page-header flex-between">
          <div>
            <h1>Session <span className="text-gradient">History</span></h1>
            <p>Review your past workouts and AI feedback.</p>
          </div>
          <button className="btn btn-secondary"><Filter size={18} /> Filter</button>
        </div>

        <div className="history-list">
          {sessions.map((session) => (
            <div key={session.id} className="history-card glass-card">
              <div className="history-info">
                <div className="history-icon">
                  <Activity size={24} className="text-accent" />
                </div>
                <div>
                  <h3>{session.type}</h3>
                  <div className="history-meta">
                    <span><Calendar size={14} /> {session.date}</span>
                    <span><Clock size={14} /> {session.duration}</span>
                  </div>
                </div>
              </div>
              <div className="history-score">
                <span className="score-label">Form Score</span>
                <span className={`score-badge ${session.score >= 90 ? 'excellent' : 'good'}`}>
                  {session.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="load-more">
          <button className="btn btn-secondary">Load Previous Sessions</button>
        </div>
      </div>
    </div>
  );
};

export default History;
