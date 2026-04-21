import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { fetchChatHistory, generateFitnessReply } from '../lib/gemini';
import { apiFetch } from '../lib/api';
import './Chatbot.css';

const FALLBACK_MESSAGE = 'Unable to fetch response. Try basic exercises like stretching and posture correction';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [healthData, setHealthData] = useState({ postureScore: 70, activityLevel: 'Moderate', mood: 'Neutral' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const summary = await apiFetch('/api/activity/summary?days=30');
        setHealthData({
          postureScore: summary?.postureScore ?? 70,
          activityLevel: (summary?.totalActiveMinutes ?? 0) > 150 ? 'High' : 'Moderate',
          mood: summary?.moodStatus || 'Neutral'
        });
      } catch (error) {
        setHealthData({ postureScore: 70, activityLevel: 'Moderate', mood: 'Neutral' });
      }
    };

    loadContext();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchChatHistory(50);

      if (!history.length) {
        setMessages([
          {
            id: `welcome-${Date.now()}`,
            sender: 'bot',
            text: "Hello! I'm your Zenith Health AI Coach. Ask me anything about your training and recovery.",
            timestamp: new Date().toISOString()
          }
        ]);
        return;
      }

      const orderedHistory = [...history].reverse();
      const hydratedMessages = orderedHistory.flatMap((item) => [
        { id: `user-${item._id}`, sender: 'user', text: item.userInput, timestamp: item.createdAt },
        { id: `bot-${item._id}`, sender: 'bot', text: item.botReply, timestamp: item.createdAt }
      ]);

      setMessages(hydratedMessages);
    };

    loadHistory();
  }, []);

  const quickPrompts = ["Improve squat form", 'I feel tired today', 'Reduce stress', 'Build weekly plan'];

  const appendMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender,
        text,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleSend = async (overrideText) => {
    const trimmedText = (overrideText ?? inputValue).trim();
    if (!trimmedText || loading) return;

    appendMessage('user', trimmedText);
    setInputValue('');
    setLoading(true);

    try {
      const botReply = await generateFitnessReply({ userInput: trimmedText, healthData });
      appendMessage('bot', botReply || FALLBACK_MESSAGE);
    } catch (error) {
      appendMessage('bot', FALLBACK_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-container chat-page">
      <div className="container">
        <div className="chat-layout">
          <div className="chat-main glass-card">
            <div className="chat-header">
              <div className="bot-info">
                <div className="bot-avatar"><Bot size={24} /></div>
                <div><h3>Zenith Coach AI</h3><span className="status">Online</span></div>
              </div>
            </div>

            <div className={`chat-history ${isChatActive ? 'chat-active' : ''}`} onClick={() => setIsChatActive(true)} onMouseLeave={() => setIsChatActive(false)}>
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  {message.sender === 'bot' && <div className="msg-avatar"><Bot size={18} /></div>}
                  <div className="msg-bubble">{message.text.split('\n').map((line, idx) => (<p key={idx}>{line}</p>))}</div>
                  {message.sender === 'user' && <div className="msg-avatar"><User size={18} /></div>}
                </div>
              ))}
              {loading && <div className="message bot"><div className="msg-avatar"><Bot size={18} /></div><div className="msg-bubble typing-indicator"><span></span><span></span><span></span></div></div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="quick-prompts">
                {quickPrompts.map((prompt, idx) => (
                  <button key={idx} className="prompt-btn" onClick={() => handleSend(prompt)}><Sparkles size={14} /> {prompt}</button>
                ))}
              </div>
              <div className="input-box">
                <input id="chatbot-input" name="chatbotInput" type="text" placeholder="Ask your AI coach anything..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
                <button className="btn-send" onClick={() => handleSend()} disabled={loading}><Send size={18} /></button>
              </div>
            </div>
          </div>

          <div className="chat-sidebar glass-card">
            <h3>Health Context</h3>
            <p className="sidebar-subtitle">These values are loaded from your activity records.</p>
            <div className="context-group">
              <h4>Current Status</h4>
              <div className="context-item"><span>Mood:</span><span className="text-accent">{healthData.mood}</span></div>
              <div className="context-item"><span>Activity Level:</span><span className="text-accent">{healthData.activityLevel}</span></div>
              <div className="context-item"><span>Posture Score:</span><span className="text-accent">{healthData.postureScore ?? '--'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
