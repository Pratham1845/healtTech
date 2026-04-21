import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Download,
  Frown,
  Meh,
  PauseCircle,
  PlayCircle,
  Smile,
  StopCircle,
  Trash2
} from 'lucide-react';
import './EmotionDetection.css';

const SCRIPT_ID = 'face-api-script';
const MODEL_URL = '/emotion/model';
const DETECTION_INTERVAL = 800;
const HISTORY_LIMIT = 20;

const EMOTIONS = [
  { key: 'happy', label: 'Happy', color: '#22C55E', description: 'Positive and uplifted', icon: Smile, emoji: '😊' },
  { key: 'sad', label: 'Sad', color: '#3B82F6', description: 'Feeling down', icon: Frown, emoji: '😢' },
  { key: 'neutral', label: 'Neutral', color: '#6B7280', description: 'Calm and balanced', icon: Meh, emoji: '😐' },
  { key: 'surprised', label: 'Surprised', color: '#F59E0B', description: 'Unexpected reaction', icon: AlertCircle, emoji: '😲' },
  { key: 'angry', label: 'Angry', color: '#EF4444', description: 'Frustrated or stressed', icon: AlertCircle, emoji: '😠' },
  { key: 'fearful', label: 'Fearful', color: '#8B5CF6', description: 'Anxious or worried', icon: AlertCircle, emoji: '😨' },
  { key: 'disgusted', label: 'Disgusted', color: '#10B981', description: 'Uncomfortable reaction', icon: AlertCircle, emoji: '🤢' }
];

function loadFaceApiScript() {
  return new Promise((resolve, reject) => {
    if (window.faceapi) {
      resolve(window.faceapi);
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.faceapi), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = '/emotion/face-api.min.js';
    script.async = true;
    script.onload = () => resolve(window.faceapi);
    script.onerror = () => reject(new Error('Failed to load face-api script'));
    document.body.appendChild(script);
  });
}

function getDominantExpression(expressions) {
  return Object.entries(expressions).reduce(
    (best, [emotion, score]) => (score > best.score ? { emotion, score } : best),
    { emotion: 'neutral', score: 0 }
  );
}

const EmotionDetection = () => {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('Loading AI models...');

  const [currentEmotionKey, setCurrentEmotionKey] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [emotionCounts, setEmotionCounts] = useState(() =>
    Object.fromEntries(EMOTIONS.map((emotion) => [emotion.key, 0]))
  );
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const sessionStartRef = useRef(0);
  const pauseStartRef = useRef(0);
  const pausedMsRef = useRef(0);
  const isPausedRef = useRef(false);
  const isProcessingRef = useRef(false);

  const clearDetectionInterval = useCallback(() => {
    if (detectIntervalRef.current) {
      window.clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
  }, []);

  const clearTimerInterval = useCallback(() => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const updateSessionTime = useCallback(() => {
    if (!sessionStartRef.current) {
      setSessionSeconds(0);
      return;
    }

    const now = Date.now();
    const activeMs = now - sessionStartRef.current - pausedMsRef.current - (isPaused ? now - pauseStartRef.current : 0);
    setSessionSeconds(Math.max(0, Math.floor(activeMs / 1000)));
  }, [isPaused]);

  const startTimer = useCallback(() => {
    clearTimerInterval();
    timerIntervalRef.current = window.setInterval(updateSessionTime, 1000);
    updateSessionTime();
  }, [clearTimerInterval, updateSessionTime]);

  const loadModels = useCallback(async () => {
    try {
      setStatusText('Loading AI models...');
      setError('');

      const faceapi = await loadFaceApiScript();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);

      setIsModelReady(true);
      setStatusText('Model ready');
    } catch (err) {
      setError('Could not load emotion models. Check public emotion assets and refresh.');
      setStatusText('Model load failed');
    }
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (isProcessingRef.current || isPausedRef.current) {
      return;
    }

    const video = videoRef.current;
    const faceapi = window.faceapi;

    if (!video || !faceapi || video.readyState < 2) {
      return;
    }

    isProcessingRef.current = true;

    try {
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5
          })
        )
        .withFaceExpressions();

      if (!detections.length) {
        setStatusText('No face detected');
        return;
      }

      const dominant = getDominantExpression(detections[0].expressions);
      const matchedEmotion = EMOTIONS.find((emotion) => emotion.key === dominant.emotion) || EMOTIONS[2];

      setCurrentEmotionKey(matchedEmotion.key);
      setConfidence(Math.round(dominant.score * 100));
      setStatusText('Live detection running');

      setEmotionCounts((prev) => ({
        ...prev,
        [matchedEmotion.key]: (prev[matchedEmotion.key] || 0) + 1
      }));

      setEmotionHistory((prev) => {
        const next = [
          {
            emotion: matchedEmotion.key,
            confidence: Math.round(dominant.score * 100),
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ];
        return next.slice(0, HISTORY_LIMIT);
      });
    } catch (err) {
      setError('Detection error occurred. Try restarting camera.');
      setStatusText('Detection error');
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  const startDetectionLoop = useCallback(() => {
    clearDetectionInterval();
    detectIntervalRef.current = window.setInterval(analyzeFrame, DETECTION_INTERVAL);
  }, [analyzeFrame, clearDetectionInterval]);

  const stopCamera = useCallback(() => {
    clearDetectionInterval();
    clearTimerInterval();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
    setIsPaused(false);
    setStatusText(isModelReady ? 'Camera stopped' : 'Model not ready');
  }, [clearDetectionInterval, clearTimerInterval, isModelReady]);

  const resetSessionData = useCallback(() => {
    setCurrentEmotionKey('neutral');
    setConfidence(0);
    setEmotionHistory([]);
    setEmotionCounts(Object.fromEntries(EMOTIONS.map((emotion) => [emotion.key, 0])));
    setSessionSeconds(0);

    sessionStartRef.current = 0;
    pauseStartRef.current = 0;
    pausedMsRef.current = 0;
  }, []);

  const endSession = useCallback(() => {
    stopCamera();
    resetSessionData();
    setStatusText(isModelReady ? 'Session ended' : 'Waiting for model');
  }, [isModelReady, resetSessionData, stopCamera]);

  const startCamera = useCallback(async () => {
    if (!isModelReady) {
      setError('Models are still loading. Please wait a moment.');
      return;
    }

    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setIsCameraOn(true);
      setIsPaused(false);
      setStatusText('Camera live');

      sessionStartRef.current = Date.now();
      pauseStartRef.current = 0;
      pausedMsRef.current = 0;

      startTimer();
      startDetectionLoop();
    } catch (err) {
      setError('Unable to access camera. Please grant permission and try again.');
      setStatusText('Camera permission required');
    }
  }, [isModelReady, startDetectionLoop, startTimer]);

  const togglePauseSession = useCallback(() => {
    if (!isCameraOn) {
      return;
    }

    if (isPaused) {
      pausedMsRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = 0;
      setIsPaused(false);
      isPausedRef.current = false;
      setStatusText('Live detection running');
      startDetectionLoop();
      return;
    }

    pauseStartRef.current = Date.now();
    setIsPaused(true);
    isPausedRef.current = true;
    setStatusText('Session paused');
    clearDetectionInterval();
  }, [clearDetectionInterval, isCameraOn, isPaused, startDetectionLoop]);

  const clearHistory = useCallback(() => {
    setEmotionHistory([]);
    setEmotionCounts(Object.fromEntries(EMOTIONS.map((emotion) => [emotion.key, 0])));
  }, []);

  const exportSession = useCallback(() => {
    if (!emotionHistory.length) {
      setError('No detections available to export yet.');
      return;
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      sessionSeconds,
      currentEmotion: currentEmotionKey,
      confidence,
      counts: emotionCounts,
      history: emotionHistory
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `emotion-session-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [confidence, currentEmotionKey, emotionCounts, emotionHistory, sessionSeconds]);

  const dominantEmotion = useMemo(() => {
    const [emotionKey, count] = Object.entries(emotionCounts).reduce(
      (best, entry) => (entry[1] > best[1] ? entry : best),
      ['neutral', 0]
    );

    return {
      emotionKey,
      count
    };
  }, [emotionCounts]);

  const currentEmotion = useMemo(() => {
    return EMOTIONS.find((emotion) => emotion.key === currentEmotionKey) || EMOTIONS[2];
  }, [currentEmotionKey]);

  useEffect(() => {
    loadModels();

    return () => {
      clearDetectionInterval();
      clearTimerInterval();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [clearDetectionInterval, clearTimerInterval, loadModels]);

  useEffect(() => {
    updateSessionTime();
  }, [isPaused, updateSessionTime]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  return (
    <div className="page-container emotion-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>
              Emotion <span className="text-gradient">Detection</span>
            </h1>
            <p>Integrated face-api model from your EmotionDetection folder with live camera controls.</p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="emotion-layout">
          <div className="emotion-main glass-card">
            <div className="camera-container">
              <video ref={videoRef} autoPlay playsInline muted className={`camera-feed ${isCameraOn ? 'active' : ''}`} />

              {!isCameraOn && (
                <div className="camera-placeholder">
                  <Camera size={64} />
                  <h3>Camera Off</h3>
                  <p>Turn on camera to start live emotion analysis.</p>
                </div>
              )}

              {isCameraOn && (
                <div className="emotion-overlay">
                  <div className="emotion-badge" style={{ backgroundColor: currentEmotion.color }}>
                    <span>{currentEmotion.emoji}</span>
                    <span>{currentEmotion.label}</span>
                    <span className="confidence">{confidence}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="status-row">
              <span className={`status-dot ${isCameraOn && !isPaused ? 'live' : ''}`}></span>
              <span>{statusText}</span>
            </div>

            <div className="detection-controls multi-controls">
              {!isCameraOn ? (
                <button className="btn btn-primary btn-lg" onClick={startCamera} disabled={!isModelReady}>
                  <Camera size={20} />
                  Start
                </button>
              ) : (
                <button className="btn btn-secondary btn-lg" onClick={stopCamera}>
                  <StopCircle size={20} />
                  Camera Off
                </button>
              )}

              <button className="btn btn-secondary btn-lg" onClick={togglePauseSession} disabled={!isCameraOn || isPaused}>
                <PauseCircle size={20} />
                Pause
              </button>

              <button className="btn btn-secondary btn-lg" onClick={togglePauseSession} disabled={!isCameraOn || !isPaused}>
                <PlayCircle size={20} />
                Play
              </button>

              <button className="btn btn-danger btn-lg" onClick={endSession}>
                <StopCircle size={20} />
                End Session
              </button>
            </div>

            <div className="detection-controls multi-controls compact">
              <button className="btn btn-secondary" onClick={clearHistory}>
                <Trash2 size={18} />
                Clear Log
              </button>
            </div>

            <div className="current-emotion-display">
              <h3>Current Emotion</h3>
              <div className="emotion-display-card" style={{ borderColor: currentEmotion.color }}>
                <div className="emotion-icon-large" style={{ color: currentEmotion.color }}>
                  <span className="emoji-large">{currentEmotion.emoji}</span>
                </div>
                <h2 style={{ color: currentEmotion.color }}>{currentEmotion.label}</h2>
                <p>{currentEmotion.description}</p>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${confidence}%`, backgroundColor: currentEmotion.color }}
                  ></div>
                </div>
                <span className="confidence-text">Confidence: {confidence}%</span>
              </div>
            </div>
          </div>

          <div className="emotion-sidebar">
            <div className="emotion-history glass-card">
              <h3>Detection History</h3>
              <div className="history-list">
                {emotionHistory.length === 0 ? (
                  <p className="empty-state">No detections yet. Start the camera to begin analysis.</p>
                ) : (
                  emotionHistory.map((item, idx) => {
                    const emotion = EMOTIONS.find((entry) => entry.key === item.emotion) || EMOTIONS[2];
                    const IconComponent = emotion.icon;

                    return (
                      <div key={`${item.timestamp}-${idx}`} className="history-item">
                        <div className="history-icon" style={{ color: emotion.color }}>
                          <IconComponent size={20} />
                        </div>
                        <div className="history-details">
                          <span className="history-emotion">{emotion.label}</span>
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
              <h3>Session Stats</h3>
              <ul className="info-list">
                <li>Total detections: {emotionHistory.length}</li>
                <li>
                  Dominant emotion:{' '}
                  {(EMOTIONS.find((emotion) => emotion.key === dominantEmotion.emotionKey) || EMOTIONS[2]).label}
                  {' '}({dominantEmotion.count})
                </li>
                <li>Session time: {sessionSeconds}s</li>
                <li>Model status: {isModelReady ? 'Loaded' : 'Loading'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetection;
