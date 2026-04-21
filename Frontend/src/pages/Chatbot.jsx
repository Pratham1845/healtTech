import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm your Zenith Health AI Coach. I noticed your lower back exertion was slightly higher than normal yesterday. Would you like a 5-minute recovery stretch routine today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    "Improve squat form",
    "I feel tired today",
    "Reduce stress",
    "Build weekly plan"
  ];

  const botResponses = {
    "improve squat form": "Great question! Here are key tips for better squat form:\n\n1. Keep your feet shoulder-width apart\n2. Push your knees out as you descend\n3. Keep your chest up and core engaged\n4. Go down until thighs are parallel to ground\n5. Drive through your heels on the way up\n\nWould you like me to start the camera to analyze your form?",
    "i feel tired today": "I understand. Based on your recent activity data:\n\n• You've had 3 intense workouts this week\n• Sleep quality was 72% last night\n• Recovery score is moderate\n\nRecommendations:\n- Light stretching or yoga today\n- Focus on hydration (aim for 3L)\n- Early bedtime tonight\n\nShould I create a light recovery session for you?",
    "reduce stress": "Here's a personalized stress reduction plan:\n\n🧘 Immediate (5 min):\n- Box breathing: 4-4-4-4 pattern\n- Neck and shoulder rolls\n\n🌿 Today (15 min):\n- Guided meditation session\n- Light walk outdoors\n\n📅 This Week:\n- 2 yoga sessions\n- Digital detox 1hr before bed\n- Consistent sleep schedule\n\nYour stress markers show improvement potential. Want to start?",
    "build weekly plan": "Based on your goals and recent progress, here's your optimized week:\n\n📋 Monday: Lower Body Strength (45 min)\n📋 Tuesday: Yoga & Mobility (30 min)\n📋 Wednesday: Upper Body (40 min)\n📋 Thursday: Active Recovery (20 min)\n📋 Friday: Full Body HIIT (35 min)\n📋 Saturday: Cardio + Core (30 min)\n📋 Sunday: Rest & Stretching\n\n💡 Notes:\n- Increased recovery time between sessions\n- Added mobility work for your hip flexors\n\nShall I lock this in?",
    "default": "That's a great question! Based on your health data and goals, I'd recommend focusing on consistency this week. Would you like me to:\n\n1. Analyze your recent workout patterns\n2. Suggest personalized exercises\n3. Review your nutrition timing\n4. Create a recovery plan\n\nJust let me know what you'd prefer!"
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      let responseText = botResponses.default;

      for (const [key, response] of Object.entries(botResponses)) {
        if (lowerInput.includes(key)) {
          responseText = response;
          break;
        }
      }

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: responseText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInputValue(prompt);
    setTimeout(() => {
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        text: prompt,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(() => {
        const responseText = botResponses[prompt.toLowerCase()] || botResponses.default;
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: responseText,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    }, 100);
  };

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
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  {message.type === 'bot' && (
                    <div className="msg-avatar"><Bot size={18} /></div>
                  )}
                  <div className="msg-bubble">
                    {message.text.split('\n').map((line, idx) => (
                      <p key={idx} style={{ marginBottom: line === '' ? '0.5rem' : '0.25rem' }}>{line}</p>
                    ))}
                  </div>
                  {message.type === 'user' && (
                    <div className="msg-avatar"><User size={18} /></div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="message bot">
                  <div className="msg-avatar"><Bot size={18} /></div>
                  <div className="msg-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="quick-prompts">
                {quickPrompts.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    className="prompt-btn"
                    onClick={() => handleQuickPrompt(prompt)}
                  >
                    <Sparkles size={14} /> {prompt}
                  </button>
                ))}
              </div>
              <div className="input-box">
                <input 
                  type="text" 
                  placeholder="Ask your AI coach anything..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className="btn-send" onClick={handleSend}>
                  <Send size={18} />
                </button>
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
              <div className="context-item">
                <span>2 days ago:</span>
                <span>Yoga Flow (30 mins)</span>
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
              <div className="context-item">
                <span>Recovery Score:</span>
                <span className="text-accent">78%</span>
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
              <div className="context-item">
                <span>Build consistency (4x/week)</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
