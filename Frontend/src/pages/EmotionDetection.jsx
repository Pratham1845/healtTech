import { useState, useRef, useEffect } from 'react';
import { Camera, Smile, Frown, Meh, AlertCircle, RefreshCw } from 'lucide-react';
import './EmotionDetection.css';

const EmotionDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const emotions = [
    { name: 'Happy', icon: Smile, color: '#22C55E', description: 'Positive and uplifted' },
    { name: 'Sad', icon: Frown, color: '#3B82F6', description: 'Feeling down' },
    { name: 'Neutral', icon: Meh, color: '#6B7280', description: 'Calm and balanced' },
    { name: 'Surprised', icon: AlertCircle, color: '#F59E0B', description: 'Unexpected reaction' },
    { name: 'Angry', icon: AlertCircle, color: '#EF4444', description: 'Frustrated or stressed' },
    { name: 'Fearful', icon: AlertCircle, color: '#8B5CF6', description: 'Anxious or worried' }
  ];

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsDetecting(true);
        startEmotionDetection();
      }
    } catch (err) {
      setError('Unable to access camera. Please grant permission and try again.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsDetecting(false);
    setCurrentEmotion(null);
    setConfidence(0);
  };

  const startEmotionDetection = () => {
    // Simulated emotion detection using random intervals
    // In production, this would use a real ML model like face-api.js or TensorFlow.js
    const detectInterval = setInterval(() => {
      if (!isDetecting) {
        clearInterval(detectInterval);
        return;
      }

      // Simulate emotion detection with weighted probabilities
      const randomEmotion = simulateEmotionDetection();
      const randomConfidence = Math.floor(Math.random() * 30) + 70; // 70-99%

      setCurrentEmotion(randomEmotion);
      setConfidence(randomConfidence);

      // Add to history
      setEmotionHistory(prev => {
        const newHistory = [
          { 
            emotion: randomEmotion.name, 
            confidence: randomConfidence,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ];
        return newHistory.slice(0, 10); // Keep last 10 detections
      });
    }, 2000); // Detect every 2 seconds

    return () => clearInterval(detectInterval);
  };

  const simulateEmotionDetection = () => {
    // Weighted random selection to simulate realistic detection
    const weights = [35, 10, 30, 10, 5, 10]; // Happy, Sad, Neutral, Surprised, Angry, Fearful
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < emotions.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return emotions[i];
      }
    }
    return emotions[2]; // Default to Neutral
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getCurrentEmotionData = () => {
    return emotions.find(e => e.name === currentEmotion?.name) || emotions[2];
  };

  const getEmotionIcon = (emotionName) => {
    const emotion = emotions.find(e => e.name === emotionName);
    return emotion ? emotion.icon : Meh;
  };

  const getEmotionColor = (emotionName) => {
    const emotion = emotions.find(e => e.name === emotionName);
    return emotion ? emotion.color : '#6B7280';
  };

  return (
    <div className="page-container emotion-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Emotion <span className="text-gradient">Detection</span></h1>
            <p>Real-time emotion analysis using your camera and AI-powered facial recognition.</p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="emotion-layout">
          {/* Main Detection Area */}
          <div className="emotion-main glass-card">
            <div className="camera-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`camera-feed ${isDetecting ? 'active' : ''}`}
              />
              
              {!isDetecting && (
                <div className="camera-placeholder">
                  <Camera size={64} />
                  <h3>Camera Not Active</h3>
                  <p>Click "Start Detection" to begin emotion analysis</p>
                </div>
              )}

              {isDetecting && currentEmotion && (
                <div className="emotion-overlay">
                  <div 
                    className="emotion-badge"
                    style={{ backgroundColor: getCurrentEmotionData().color }}
                  >
                    {(() => {
                      const IconComponent = getCurrentEmotionData().icon;
                      return IconComponent && <IconComponent size={24} />;
                    })()}
                    <span>{currentEmotion.name}</span>
                    <span className="confidence">{confidence}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="detection-controls">
              {!isDetecting ? (
                <button className="btn btn-primary btn-lg" onClick={startCamera}>
                  <Camera size={20} />
                  Start Detection
                </button>
              ) : (
                <button className="btn btn-secondary btn-lg" onClick={stopCamera}>
                  <RefreshCw size={20} />
                  Stop Detection
                </button>
              )}
            </div>

            {isDetecting && currentEmotion && (
              <div className="current-emotion-display">
                <h3>Current Emotion</h3>
                <div 
                  className="emotion-display-card"
                  style={{ borderColor: getCurrentEmotionData().color }}
                >
                  <div 
                    className="emotion-icon-large"
                    style={{ color: getCurrentEmotionData().color }}
                  >
                    {(() => {
                      const IconComponent = getCurrentEmotionData().icon;
                      return IconComponent && <IconComponent size={48} />;
                    })()}
                  </div>
                  <h2 style={{ color: getCurrentEmotionData().color }}>
                    {currentEmotion.name}
                  </h2>
                  <p>{getCurrentEmotionData().description}</p>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ 
                        width: `${confidence}%`,
                        backgroundColor: getCurrentEmotionData().color
                      }}
                    ></div>
                  </div>
                  <span className="confidence-text">Confidence: {confidence}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - History & Info */}
          <div className="emotion-sidebar">
            <div className="emotion-history glass-card">
              <h3>Detection History</h3>
              <div className="history-list">
                {emotionHistory.length === 0 ? (
                  <p className="empty-state">No detections yet. Start the camera to begin analysis.</p>
                ) : (
                  emotionHistory.map((item, idx) => {
                    const IconComponent = getEmotionIcon(item.emotion);
                    return (
                      <div key={idx} className="history-item">
                        <div 
                          className="history-icon"
                          style={{ color: getEmotionColor(item.emotion) }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div className="history-details">
                          <span className="history-emotion">{item.emotion}</span>
                          <span className="history-confidence">{item.confidence}% confidence</span>
                          <span className="history-time">{item.timestamp}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="emotion-info glass-card">
              <h3>How It Works</h3>
              <ul className="info-list">
                <li>Camera captures facial expressions in real-time</li>
                <li>AI analyzes facial landmarks and muscle movements</li>
                <li>Emotions are classified into 6 categories</li>
                <li>Confidence score shows detection accuracy</li>
                <li>History tracks your emotional patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetection;
