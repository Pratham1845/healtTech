import { useEffect, useState } from 'react';
import { Calendar, Activity, Filter } from 'lucide-react';
import { fetchChatHistory } from '../lib/gemini';
import './History.css';

const History = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchChatHistory(100);
      setSessions(history);
    };

    loadHistory();
  }, []);

  return (
    <div className="page-container history-page">
      <div className="container">
        <div className="page-header flex-between">
          <div>
            <h1>Session <span className="text-gradient">History</span></h1>
            <p>Live chat and coaching logs from backend storage.</p>
          </div>
          <button className="btn btn-secondary"><Filter size={18} /> Live</button>
        </div>

        <div className="history-list">
          {sessions.length === 0 ? (
            <div className="history-card glass-card">
              <div className="history-info">
                <div className="history-icon">
                  <Activity size={24} className="text-accent" />
                </div>
                <div>
                  <h3>No history yet</h3>
                  <div className="history-meta">
                    <span>Start chatting to see live stored data here.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session._id} className="history-card glass-card">
                <div className="history-info">
                  <div className="history-icon">
                    <Activity size={24} className="text-accent" />
                  </div>
                  <div>
                    <h3>{session.userInput}</h3>
                    <div className="history-meta">
                      <span><Calendar size={14} /> {new Date(session.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="history-preview">{session.botReply}</p>
                  </div>
                </div>
                <div className="history-score">
                  <span className="score-label">Posture</span>
                  <span className={`score-badge ${(session.healthData?.postureScore ?? 0) >= 90 ? 'excellent' : 'good'}`}>
                    {session.healthData?.postureScore ?? '--'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
