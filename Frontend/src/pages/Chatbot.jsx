import { Send, Bot, User, Sparkles } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  return (
    <div className="page-container chat-page">
      <div className="container">
        <div className="chat-layout">
          
          {/* Main Chat Area */}
          <div className="chat-main glass-card">
            <div className="chat-header">
              <div className="bot-info">
                <div className="bot-avatar"><Bot size={24} /></div>
                <div>
                  <h3>Zenith Coach AI</h3>
                  <span className="status">Online</span>
                </div>
              </div>
            </div>

            <div className="chat-history">
              <div className="message bot">
                <div className="msg-avatar"><Bot size={18} /></div>
                <div className="msg-bubble">
                  Hello Alex! I noticed your lower back exertion was slightly higher than normal yesterday. Would you like a 5-minute recovery stretch routine today?
                </div>
              </div>
              <div className="message user">
                <div className="msg-bubble">
                  Yes, that sounds great. What do you recommend?
                </div>
                <div className="msg-avatar"><User size={18} /></div>
              </div>
              <div className="message bot">
                <div className="msg-avatar"><Bot size={18} /></div>
                <div className="msg-bubble">
                  <p>Perfect. Here's a quick sequence focused on decompression:</p>
                  <ul className="chat-list">
                    <li>Cat-Cow stretch (60s)</li>
                    <li>Child's pose (60s)</li>
                    <li>Supine spinal twist (30s each side)</li>
                  </ul>
                  <p>Would you like me to start the camera to guide your form?</p>
                </div>
              </div>
            </div>

            <div className="chat-input-area">
              <div className="quick-prompts">
                <button className="prompt-btn"><Sparkles size={14} /> Start camera guide</button>
                <button className="prompt-btn">Analyze my last workout</button>
                <button className="prompt-btn">Why am I tired?</button>
              </div>
              <div className="input-box">
                <input type="text" placeholder="Ask your AI coach anything..." />
                <button className="btn-send"><Send size={18} /></button>
              </div>
            </div>
          </div>

          {/* Context Sidebar */}
          <div className="chat-sidebar glass-card">
            <h3>Health Context</h3>
            <p className="sidebar-subtitle">AI analyzes this context for personalized answers.</p>
            
            <div className="context-group">
              <h4>Recent Activity</h4>
              <div className="context-item">
                <span>Yesterday:</span>
                <span>Heavy Squats (45 mins)</span>
              </div>
            </div>

            <div className="context-group">
              <h4>Current Status</h4>
              <div className="context-item">
                <span>Mood:</span>
                <span className="text-accent">Calm</span>
              </div>
              <div className="context-item">
                <span>Fatigue Level:</span>
                <span className="text-accent">Moderate</span>
              </div>
            </div>
            
            <div className="context-group">
              <h4>Active Goals</h4>
              <div className="context-item">
                <span>Fix anterior pelvic tilt</span>
              </div>
              <div className="context-item">
                <span>Increase mobility</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
