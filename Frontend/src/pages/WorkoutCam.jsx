import { Camera, Activity, PauseCircle, StopCircle, RefreshCw } from 'lucide-react';
import './WorkoutCam.css';

const WorkoutCam = () => {
  return (
    <div className="page-container workout-page">
      <div className="container">
        <div className="page-header flex-between">
          <div>
            <h1>Workout <span className="text-gradient">Camera</span></h1>
            <p>Real-time AI movement analysis</p>
          </div>
          <div className="session-controls">
            <button className="btn btn-secondary"><PauseCircle size={18} /> Pause</button>
            <button className="btn btn-danger"><StopCircle size={18} /> End Session</button>
          </div>
        </div>

        <div className="workout-layout split-layout">
          
          {/* Left: Webcam Frame */}
          <div className="webcam-frame glass-card">
            <div className="webcam-header">
              <div className="recording-dot pulse"></div>
              <span>Live Analysis Active</span>
            </div>
            
            <div className="webcam-view">
              <div className="skeleton-human">
                {/* CSS Skeleton */}
                <div className="skel-node skel-head">
                  <div className="mood-badge badge-positive">Focused</div>
                </div>
                <div className="skel-line skel-spine"></div>
                <div className="skel-line skel-arm-l"></div>
                <div className="skel-node skel-elbow-l"></div>
                <div className="skel-line skel-arm-r"></div>
                <div className="skel-node skel-elbow-r"></div>
                <div className="skel-line skel-leg-l"></div>
                <div className="skel-node skel-knee-l"></div>
                <div className="skel-line skel-leg-r"></div>
                <div className="skel-node skel-knee-r"></div>
                
                <div className="feedback-badge badge-warning animate-pulse">
                  Keep Back Straight
                </div>
              </div>
              <div className="webcam-grid"></div>
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="workout-metrics">
            <div className="metrics-grid">
              <div className="metric-box glass-card">
                <span className="box-label">Squats</span>
                <span className="box-value text-gradient">12/15</span>
              </div>
              <div className="metric-box glass-card">
                <span className="box-label">Form Accuracy</span>
                <span className="box-value text-gradient">92%</span>
              </div>
              <div className="metric-box glass-card">
                <span className="box-label">Tempo</span>
                <span className="box-value text-gradient">Perfect</span>
              </div>
              <div className="metric-box glass-card">
                <span className="box-label">Exertion</span>
                <span className="box-value text-gradient">Medium</span>
              </div>
            </div>

            <div className="live-feed glass-card">
              <div className="feed-header">
                <h4>AI Event Log</h4>
                <button className="btn-icon"><RefreshCw size={14} /></button>
              </div>
              <ul className="log-list">
                <li className="log-item success">
                  <Activity size={16} /> <span>Great form on repetition 11</span>
                </li>
                <li className="log-item warning">
                  <Activity size={16} /> <span>Slight forward lean detected</span>
                </li>
                <li className="log-item info">
                  <Activity size={16} /> <span>Pacing is optimal (2s down, 1s up)</span>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default WorkoutCam;
