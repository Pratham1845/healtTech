import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Camera,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  StopCircle
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import './WorkoutCam.css';

const squatImage = '/assets/squads.jpeg';
const pushupImage = '/assets/pushups.jpeg';
const jumpingJackImage = '/assets/jumpingjags.jpeg';

const MEDIAPIPE_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'
];

const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28
};

const CONFIG = {
  minVisibility: 0.55,
  smoothingAlpha: 0.4,
  activeMotionThreshold: 0.03,
  inactivityMs: 2200,
  durationTargetSec: 180,
  squat: {
    downAngle: 95,
    upAngle: 160,
    backMinAngle: 148,
    kneeForwardThreshold: 0.12,
    depthWarningAngle: 108
  },
  pushup: {
    downAngle: 92,
    upAngle: 158,
    bodyLineMinAngle: 155,
    depthWarningAngle: 108
  },
  jumpingJack: {
    legsOpenRatio: 1.6,
    legsClosedRatio: 1.2,
    wristsAboveShoulderOffset: 0.02,
    wristsBelowShoulderOffset: 0.05
  }
};

function initializeExerciseState(initialPhase) {
  return {
    phase: initialPhase,
    reps: 0,
    correctReps: 0,
    downReached: false,
    repFormBad: false,
    feedback: 'Ready',
    lastMetricsText: 'Waiting for movement...'
  };
}

function isVisible(point, min = CONFIG.minVisibility) {
  return !!point && typeof point.visibility === 'number' && point.visibility >= min;
}

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateAngle(a, b, c) {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;

  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
  if (mag1 < 1e-6 || mag2 < 1e-6) {
    return 180;
  }

  const dot = v1x * v2x + v1y * v2y;
  const cosine = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosine) * (180 / Math.PI);
}

function chooseBestSide(landmarks, jointIndexes) {
  const leftPoints = jointIndexes.left.map((idx) => landmarks[idx]);
  const rightPoints = jointIndexes.right.map((idx) => landmarks[idx]);

  const leftVisible = leftPoints.every((point) => isVisible(point));
  const rightVisible = rightPoints.every((point) => isVisible(point));

  if (!leftVisible && !rightVisible) {
    return null;
  }
  if (leftVisible && !rightVisible) {
    return { side: 'left', points: leftPoints };
  }
  if (!leftVisible && rightVisible) {
    return { side: 'right', points: rightPoints };
  }

  const leftScore = leftPoints.reduce((sum, point) => sum + point.visibility, 0);
  const rightScore = rightPoints.reduce((sum, point) => sum + point.visibility, 0);

  return leftScore >= rightScore
    ? { side: 'left', points: leftPoints }
    : { side: 'right', points: rightPoints };
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-mp='${src}']`);
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.mp = src;
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

const WorkoutCam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);

  const appStateRef = useRef({
    currentExercise: 'squat',
    sessionStartMs: null,
    previousFrameMs: null,
    lastMovementMs: 0,
    activeMs: 0,
    inactiveMs: 0,
    poseDetected: false,
    smoothedLandmarks: null,
    previousLandmarks: null,
    metricSmoothing: {}
  });

  const exercisesRef = useRef(null);

  const [scriptsReady, setScriptsReady] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [statusText, setStatusText] = useState('Loading pose engine...');
  const [error, setError] = useState('');

  const [currentExercise, setCurrentExercise] = useState('squat');
  const [exerciseState, setExerciseState] = useState('INACTIVE');
  const [exerciseReps, setExerciseReps] = useState(0);
  const [accuracyText, setAccuracyText] = useState('0 / 0 (0%)');
  const [fitnessScore, setFitnessScore] = useState(0);
  const [totalTime, setTotalTime] = useState('0.0s');
  const [activeTime, setActiveTime] = useState('0.0s');
  const [feedbackText, setFeedbackText] = useState('Stand in frame to start tracking.');
  const [metricText, setMetricText] = useState('Waiting for landmarks...');
  const [perExercise, setPerExercise] = useState([
    { label: 'Squat', reps: 0, accuracy: 0 },
    { label: 'Push-Up', reps: 0, accuracy: 0 },
    { label: 'Jumping Jack', reps: 0, accuracy: 0 }
  ]);
  const [eventLog, setEventLog] = useState([]);

  const pushEvent = useCallback((message, type = 'info') => {
    setEventLog((prev) => {
      const next = [{ message, type, time: new Date().toLocaleTimeString() }, ...prev];
      return next.slice(0, 8);
    });
  }, []);

  const smoothMetric = useCallback((key, value) => {
    if (!Number.isFinite(value)) {
      return value;
    }

    const appState = appStateRef.current;
    const prev = appState.metricSmoothing[key];
    if (prev === undefined) {
      appState.metricSmoothing[key] = value;
      return value;
    }

    const next = prev * 0.7 + value * 0.3;
    appState.metricSmoothing[key] = next;
    return next;
  }, []);

  const smoothLandmarks = useCallback((rawLandmarks) => {
    if (!Array.isArray(rawLandmarks)) {
      return null;
    }

    const appState = appStateRef.current;
    if (!appState.smoothedLandmarks) {
      appState.smoothedLandmarks = rawLandmarks.map((point) => ({ ...point }));
      return appState.smoothedLandmarks;
    }

    const alpha = CONFIG.smoothingAlpha;
    appState.smoothedLandmarks = rawLandmarks.map((point, idx) => {
      const prev = appState.smoothedLandmarks[idx] || point;
      return {
        x: prev.x + alpha * (point.x - prev.x),
        y: prev.y + alpha * (point.y - prev.y),
        z: prev.z + alpha * ((point.z || 0) - (prev.z || 0)),
        visibility: point.visibility
      };
    });

    return appState.smoothedLandmarks;
  }, []);

  const totalReps = useCallback(() => {
    return Object.values(exercisesRef.current || {}).reduce((sum, exercise) => sum + exercise.state.reps, 0);
  }, []);

  const totalCorrectReps = useCallback(() => {
    return Object.values(exercisesRef.current || {}).reduce((sum, exercise) => sum + exercise.state.correctReps, 0);
  }, []);

  const computeFitnessScore = useCallback(() => {
    const reps = totalReps();
    const correct = totalCorrectReps();

    const qualityScore = reps > 0 ? (correct / reps) * 100 : 0;
    const volumeScore = Math.min(100, reps * 5);
    const durationSec = appStateRef.current.activeMs / 1000;
    const durationScore = Math.min(100, (durationSec / CONFIG.durationTargetSec) * 100);

    return Math.round(qualityScore * 0.5 + volumeScore * 0.2 + durationScore * 0.3);
  }, [totalCorrectReps, totalReps]);

  const renderUi = useCallback(() => {
    const appState = appStateRef.current;
    const module = exercisesRef.current?.[appState.currentExercise];
    if (!module) {
      return;
    }

    const reps = module.state.reps;
    const correct = module.state.correctReps;
    const accuracy = reps > 0 ? Math.round((correct / reps) * 100) : 0;

    const now = Date.now();
    const totalTimeSec = appState.sessionStartMs ? (now - appState.sessionStartMs) / 1000 : 0;

    setCurrentExercise(appState.currentExercise);
    setExerciseState(appState.poseDetected ? module.state.phase : 'INACTIVE');
    setExerciseReps(reps);
    setAccuracyText(`${correct} / ${reps} (${accuracy}%)`);
    setFitnessScore(computeFitnessScore());
    setFeedbackText(module.state.feedback);
    setMetricText(module.state.lastMetricsText);
    setTotalTime(`${totalTimeSec.toFixed(1)}s`);
    setActiveTime(`${(appState.activeMs / 1000).toFixed(1)}s`);

    setPerExercise(
      Object.values(exercisesRef.current).map((exercise) => {
        const itemReps = exercise.state.reps;
        const itemCorrect = exercise.state.correctReps;
        const itemAccuracy = itemReps > 0 ? Math.round((itemCorrect / itemReps) * 100) : 0;
        return { label: exercise.label, reps: itemReps, accuracy: itemAccuracy };
      })
    );
  }, [computeFitnessScore]);

  const computeMotionScore = useCallback((landmarks) => {
    const appState = appStateRef.current;
    if (!appState.previousLandmarks) {
      appState.previousLandmarks = landmarks.map((point) => ({ x: point.x, y: point.y }));
      return 0;
    }

    const important = [
      LANDMARKS.LEFT_SHOULDER,
      LANDMARKS.RIGHT_SHOULDER,
      LANDMARKS.LEFT_HIP,
      LANDMARKS.RIGHT_HIP,
      LANDMARKS.LEFT_KNEE,
      LANDMARKS.RIGHT_KNEE,
      LANDMARKS.LEFT_ANKLE,
      LANDMARKS.RIGHT_ANKLE,
      LANDMARKS.LEFT_WRIST,
      LANDMARKS.RIGHT_WRIST
    ];

    let total = 0;
    for (const idx of important) {
      const prev = appState.previousLandmarks[idx];
      const curr = landmarks[idx];
      if (!prev || !curr) {
        continue;
      }
      total += Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y);
    }

    appState.previousLandmarks = landmarks.map((point) => ({ x: point.x, y: point.y }));
    return total / important.length;
  }, []);

  const updateActivityTimers = useCallback((nowMs, motionScore, hasPose) => {
    const appState = appStateRef.current;

    if (!appState.sessionStartMs) {
      appState.sessionStartMs = nowMs;
    }
    if (!appState.previousFrameMs) {
      appState.previousFrameMs = nowMs;
    }

    const dt = nowMs - appState.previousFrameMs;
    appState.previousFrameMs = nowMs;

    if (!hasPose) {
      appState.inactiveMs += dt;
      return;
    }

    const currentModule = exercisesRef.current?.[appState.currentExercise];
    const activeByPhase = currentModule && (currentModule.state.phase === 'DOWN' || currentModule.state.phase === 'OPEN');

    if (motionScore > CONFIG.activeMotionThreshold || activeByPhase) {
      appState.lastMovementMs = nowMs;
    }

    const active = nowMs - appState.lastMovementMs <= CONFIG.inactivityMs;
    if (active) {
      appState.activeMs += dt;
    } else {
      appState.inactiveMs += dt;
    }
  }, []);

  const drawPose = useCallback((results) => {
    const ctx = canvasRef.current?.getContext('2d');
    const canvas = canvasRef.current;
    if (!ctx || !canvas) {
      return;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks && window.drawConnectors && window.drawLandmarks && window.POSE_CONNECTIONS) {
      window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#5ad8ff', lineWidth: 3 });
      window.drawLandmarks(ctx, results.poseLandmarks, { color: '#ffd778', radius: 4, lineWidth: 1 });
    }

    ctx.restore();
  }, []);

  const onPoseResults = useCallback(
    (results) => {
      drawPose(results);

      const now = Date.now();
      const rawLandmarks = results.poseLandmarks;
      const appState = appStateRef.current;
      appState.poseDetected = Array.isArray(rawLandmarks) && rawLandmarks.length > 0;

      if (!appState.poseDetected) {
        updateActivityTimers(now, 0, false);
        const module = exercisesRef.current?.[appState.currentExercise];
        if (module) {
          module.state.feedback = 'Step into frame to continue tracking.';
          module.state.lastMetricsText = 'Waiting for landmarks...';
        }
        renderUi();
        return;
      }

      const landmarks = smoothLandmarks(rawLandmarks);
      const motionScore = computeMotionScore(landmarks);

      const module = exercisesRef.current?.[appState.currentExercise];
      module?.update(landmarks);
      updateActivityTimers(now, motionScore, true);
      renderUi();
    },
    [computeMotionScore, drawPose, renderUi, smoothLandmarks, updateActivityTimers]
  );

  const initExerciseModules = useCallback(() => {
    if (exercisesRef.current) {
      return;
    }

    const exercises = {
      squat: {
        label: 'Squat',
        state: initializeExerciseState('UP'),
        detect(landmarks) {
          const selection = chooseBestSide(landmarks, {
            left: [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
            right: [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE]
          });
          if (!selection) {
            return null;
          }

          const [shoulder, hip, knee, ankle] = selection.points;
          const kneeAngle = smoothMetric('squat_knee', calculateAngle(hip, knee, ankle));
          const backAngle = smoothMetric('squat_back', calculateAngle(shoulder, hip, knee));
          const kneeForward = Math.abs(knee.x - ankle.x) > CONFIG.squat.kneeForwardThreshold;

          return { kneeAngle, backAngle, kneeForward };
        },
        checkForm(metrics) {
          const messages = [];
          let good = true;

          if (metrics.backAngle < CONFIG.squat.backMinAngle) {
            messages.push('Keep back straight.');
            good = false;
          }
          if (metrics.kneeForward) {
            messages.push('Do not push knees too far forward.');
            good = false;
          }
          if (this.state.phase === 'DOWN' && metrics.kneeAngle > CONFIG.squat.depthWarningAngle) {
            messages.push('Go lower for full squat range.');
            good = false;
          }
          if (messages.length === 0) {
            messages.push('Good squat form.');
          }

          return { good, message: messages.join(' ') };
        },
        countRep(metrics) {
          const prevPhase = this.state.phase;

          if (metrics.kneeAngle < CONFIG.squat.downAngle) {
            this.state.phase = 'DOWN';
            this.state.downReached = true;
          } else if (metrics.kneeAngle > CONFIG.squat.upAngle) {
            this.state.phase = 'UP';
          }

          if (prevPhase === 'DOWN' && this.state.phase === 'UP' && this.state.downReached) {
            this.state.reps += 1;
            if (!this.state.repFormBad) {
              this.state.correctReps += 1;
            }
            this.state.downReached = false;
            this.state.repFormBad = false;
            pushEvent(`Squat rep counted. Total: ${this.state.reps}`, 'success');
          }
        },
        update(landmarks) {
          const metrics = this.detect(landmarks);
          if (!metrics) {
            this.state.feedback = 'Align full side body in frame for squat detection.';
            this.state.lastMetricsText = 'Knee angle: -- | Back angle: -- | Knee forward: --';
            return;
          }

          this.countRep(metrics);
          const form = this.checkForm(metrics);
          if (!form.good) {
            this.state.repFormBad = true;
          }

          this.state.feedback = form.message;
          this.state.lastMetricsText = `Knee angle: ${metrics.kneeAngle.toFixed(1)} deg | Back angle: ${metrics.backAngle.toFixed(1)} deg | Knee forward: ${metrics.kneeForward ? 'Yes' : 'No'}`;
        }
      },
      pushup: {
        label: 'Push-Up',
        state: initializeExerciseState('UP'),
        detect(landmarks) {
          const selection = chooseBestSide(landmarks, {
            left: [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST, LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_ANKLE],
            right: [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST, LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_ANKLE]
          });
          if (!selection) {
            return null;
          }

          const [shoulder, elbow, wrist, hip, ankle] = selection.points;
          const elbowAngle = smoothMetric('pushup_elbow', calculateAngle(shoulder, elbow, wrist));
          const bodyLineAngle = smoothMetric('pushup_body', calculateAngle(shoulder, hip, ankle));

          return { elbowAngle, bodyLineAngle };
        },
        checkForm(metrics) {
          const messages = [];
          let good = true;

          if (metrics.bodyLineAngle < CONFIG.pushup.bodyLineMinAngle) {
            messages.push('Keep body straight from shoulder to ankle.');
            good = false;
          }
          if (this.state.phase === 'DOWN' && metrics.elbowAngle > CONFIG.pushup.depthWarningAngle) {
            messages.push('Lower chest more for full push-up.');
            good = false;
          }
          if (messages.length === 0) {
            messages.push('Good push-up form.');
          }

          return { good, message: messages.join(' ') };
        },
        countRep(metrics) {
          const prevPhase = this.state.phase;

          if (metrics.elbowAngle < CONFIG.pushup.downAngle) {
            this.state.phase = 'DOWN';
            this.state.downReached = true;
          } else if (metrics.elbowAngle > CONFIG.pushup.upAngle) {
            this.state.phase = 'UP';
          }

          if (prevPhase === 'DOWN' && this.state.phase === 'UP' && this.state.downReached) {
            this.state.reps += 1;
            if (!this.state.repFormBad) {
              this.state.correctReps += 1;
            }
            this.state.downReached = false;
            this.state.repFormBad = false;
            pushEvent(`Push-up rep counted. Total: ${this.state.reps}`, 'success');
          }
        },
        update(landmarks) {
          const metrics = this.detect(landmarks);
          if (!metrics) {
            this.state.feedback = 'Keep shoulder, elbow, wrist, hip, and ankle visible.';
            this.state.lastMetricsText = 'Elbow angle: -- | Body line angle: --';
            return;
          }

          this.countRep(metrics);
          const form = this.checkForm(metrics);
          if (!form.good) {
            this.state.repFormBad = true;
          }

          this.state.feedback = form.message;
          this.state.lastMetricsText = `Elbow angle: ${metrics.elbowAngle.toFixed(1)} deg | Body line angle: ${metrics.bodyLineAngle.toFixed(1)} deg`;
        }
      },
      jumpingJack: {
        label: 'Jumping Jack',
        state: initializeExerciseState('CLOSED'),
        detect(landmarks) {
          const required = [
            LANDMARKS.LEFT_WRIST,
            LANDMARKS.RIGHT_WRIST,
            LANDMARKS.LEFT_SHOULDER,
            LANDMARKS.RIGHT_SHOULDER,
            LANDMARKS.LEFT_ANKLE,
            LANDMARKS.RIGHT_ANKLE,
            LANDMARKS.LEFT_HIP,
            LANDMARKS.RIGHT_HIP
          ];

          const points = required.map((idx) => landmarks[idx]);
          if (!points.every((point) => isVisible(point, 0.5))) {
            return null;
          }

          const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
          const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
          const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
          const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
          const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
          const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];
          const leftHip = landmarks[LANDMARKS.LEFT_HIP];
          const rightHip = landmarks[LANDMARKS.RIGHT_HIP];

          const avgWristY = (leftWrist.y + rightWrist.y) / 2;
          const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

          const ankleDistance = distance2D(leftAnkle, rightAnkle);
          const hipDistance = distance2D(leftHip, rightHip);

          const armsUp = avgWristY < avgShoulderY - CONFIG.jumpingJack.wristsAboveShoulderOffset;
          const armsDown = avgWristY > avgShoulderY + CONFIG.jumpingJack.wristsBelowShoulderOffset;

          const openRatio = hipDistance > 0 ? ankleDistance / hipDistance : 1;
          const legsOpen = openRatio > CONFIG.jumpingJack.legsOpenRatio;
          const legsClosed = openRatio < CONFIG.jumpingJack.legsClosedRatio;

          return { armsUp, armsDown, legsOpen, legsClosed, openRatio };
        },
        checkForm(metrics) {
          const messages = [];
          let good = true;

          if (this.state.phase === 'OPEN' && (!metrics.armsUp || !metrics.legsOpen)) {
            messages.push('Reach full star shape with arms up and legs wide.');
            good = false;
          }
          if (metrics.armsUp && !metrics.legsOpen) {
            messages.push('Open legs wider when lifting arms.');
            good = false;
          }
          if (metrics.legsOpen && !metrics.armsUp) {
            messages.push('Raise arms higher with leg opening.');
            good = false;
          }
          if (messages.length === 0) {
            messages.push('Good jumping-jack rhythm.');
          }

          return { good, message: messages.join(' ') };
        },
        countRep(metrics) {
          const prevPhase = this.state.phase;

          if (metrics.armsUp && metrics.legsOpen) {
            this.state.phase = 'OPEN';
            this.state.downReached = true;
          } else if (metrics.armsDown && metrics.legsClosed) {
            this.state.phase = 'CLOSED';
          }

          if (prevPhase === 'OPEN' && this.state.phase === 'CLOSED' && this.state.downReached) {
            this.state.reps += 1;
            if (!this.state.repFormBad) {
              this.state.correctReps += 1;
            }
            this.state.downReached = false;
            this.state.repFormBad = false;
            pushEvent(`Jumping-jack rep counted. Total: ${this.state.reps}`, 'success');
          }
        },
        update(landmarks) {
          const metrics = this.detect(landmarks);
          if (!metrics) {
            this.state.feedback = 'Keep full body visible for jumping-jack tracking.';
            this.state.lastMetricsText = 'Arms up: -- | Legs open ratio: --';
            return;
          }

          this.countRep(metrics);
          const form = this.checkForm(metrics);
          if (!form.good) {
            this.state.repFormBad = true;
          }

          this.state.feedback = form.message;
          this.state.lastMetricsText = `Arms up: ${metrics.armsUp ? 'Yes' : 'No'} | Legs open ratio: ${metrics.openRatio.toFixed(2)} | Phase: ${this.state.phase}`;
        }
      }
    };

    exercisesRef.current = exercises;
  }, [pushEvent, smoothMetric]);

  const startCamera = useCallback(async () => {
    if (!scriptsReady) {
      setError('Pose engine is still loading. Please wait a moment.');
      return;
    }

    try {
      setError('');
      setStatusText('Starting camera...');

      if (!poseRef.current) {
        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults(onPoseResults);
        poseRef.current = pose;
      }

      if (!cameraRef.current) {
        cameraRef.current = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (isPaused || !poseRef.current) {
              return;
            }
            await poseRef.current.send({ image: videoRef.current });
          },
          width: 640,
          height: 480
        });
      }

      await cameraRef.current.start();
      setIsCameraOn(true);
      setIsPaused(false);
      setStatusText(`Live tracking: ${exercisesRef.current[appStateRef.current.currentExercise].label}`);
      pushEvent('Camera started.', 'info');
      renderUi();
    } catch (err) {
      setError('Unable to start camera. Please allow webcam access and try again.');
      setStatusText('Camera permission required');
    }
  }, [isPaused, onPoseResults, pushEvent, renderUi, scriptsReady]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current?.stop) {
      cameraRef.current.stop();
    }

    const stream = videoRef.current?.srcObject;
    if (stream && stream.getTracks) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
    setIsPaused(false);
    setStatusText('Camera off');
    pushEvent('Camera stopped.', 'warning');
  }, [pushEvent]);

  const resetWorkoutState = useCallback(() => {
    appStateRef.current = {
      currentExercise,
      sessionStartMs: null,
      previousFrameMs: null,
      lastMovementMs: 0,
      activeMs: 0,
      inactiveMs: 0,
      poseDetected: false,
      smoothedLandmarks: null,
      previousLandmarks: null,
      metricSmoothing: {}
    };

    exercisesRef.current = null;
    initExerciseModules();

    setExerciseState('INACTIVE');
    setExerciseReps(0);
    setAccuracyText('0 / 0 (0%)');
    setFitnessScore(0);
    setTotalTime('0.0s');
    setActiveTime('0.0s');
    setFeedbackText('Stand in frame to start tracking.');
    setMetricText('Waiting for landmarks...');
    setPerExercise([
      { label: 'Squat', reps: 0, accuracy: 0 },
      { label: 'Push-Up', reps: 0, accuracy: 0 },
      { label: 'Jumping Jack', reps: 0, accuracy: 0 }
    ]);
  }, [currentExercise, initExerciseModules]);

  const saveWorkoutSession = useCallback(async () => {
    const appState = appStateRef.current;
    const modules = exercisesRef.current || {};
    const durationSeconds = appState.sessionStartMs ? Math.max(0, Math.round((Date.now() - appState.sessionStartMs) / 1000)) : 0;
    const activeSeconds = Math.round(appState.activeMs / 1000);

    const exerciseBreakdown = Object.values(modules).map((exercise) => {
      const reps = exercise.state.reps || 0;
      const correct = exercise.state.correctReps || 0;
      return {
        name: exercise.label,
        reps,
        accuracy: reps > 0 ? Math.round((correct / reps) * 100) : 0
      };
    });

    const totalRepsCount = exerciseBreakdown.reduce((sum, item) => sum + item.reps, 0);
    const totalCorrectCount = Object.values(modules).reduce((sum, exercise) => sum + (exercise.state.correctReps || 0), 0);

    if (!durationSeconds && !totalRepsCount && !activeSeconds) {
      return;
    }

    const postureScore = totalRepsCount > 0 ? Math.round((totalCorrectCount / totalRepsCount) * 100) : null;
    const activityRatio = durationSeconds > 0 ? activeSeconds / durationSeconds : 0;
    const activityLevel = activityRatio >= 0.7 ? 'High' : activityRatio >= 0.4 ? 'Moderate' : 'Low';

    try {
      await apiFetch('/api/activity', {
        method: 'POST',
        body: JSON.stringify({
          source: 'workout',
          sessionStartedAt: appState.sessionStartMs ? new Date(appState.sessionStartMs).toISOString() : new Date().toISOString(),
          sessionEndedAt: new Date().toISOString(),
          durationSeconds,
          activeSeconds,
          totalReps: totalRepsCount,
          correctReps: totalCorrectCount,
          accuracy: totalRepsCount > 0 ? Math.round((totalCorrectCount / totalRepsCount) * 100) : 0,
          fitnessScore: computeFitnessScore(),
          postureScore,
          mood: 'Focused',
          activityLevel,
          exerciseBreakdown,
          metadata: {
            selectedExercise: appState.currentExercise
          }
        })
      });
    } catch (error) {
      pushEvent('Could not save session to backend.', 'warning');
    }
  }, [computeFitnessScore, pushEvent]);

  const endSession = useCallback(async () => {
    await saveWorkoutSession();
    stopCamera();
    resetWorkoutState();
    pushEvent('Session ended and metrics reset.', 'warning');
  }, [pushEvent, resetWorkoutState, saveWorkoutSession, stopCamera]);

  const togglePauseSession = useCallback(() => {
    if (!isCameraOn) {
      return;
    }

    if (isPaused) {
      setIsPaused(false);
      setStatusText(`Live tracking: ${exercisesRef.current[appStateRef.current.currentExercise].label}`);
      pushEvent('Session resumed.', 'info');
      return;
    }

    setIsPaused(true);
    setStatusText('Session paused');
    pushEvent('Session paused.', 'warning');
  }, [isCameraOn, isPaused, pushEvent]);

  const clearEventLog = useCallback(() => {
    setEventLog([]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        setError('');
        setStatusText('Loading pose engine...');

        for (const script of MEDIAPIPE_SCRIPTS) {
          await loadScript(script);
        }

        if (cancelled) {
          return;
        }

        initExerciseModules();
        setScriptsReady(true);
        setStatusText('Pose engine ready');
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load MediaPipe scripts. Check internet connection and retry.');
          setStatusText('Pose engine load failed');
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [initExerciseModules, stopCamera]);

  useEffect(() => {
    appStateRef.current.currentExercise = currentExercise;
    renderUi();
  }, [currentExercise, renderUi]);

  const exerciseStateClass = useMemo(() => {
    if (exerciseState === 'UP' || exerciseState === 'CLOSED') {
      return 'good';
    }
    if (exerciseState === 'DOWN' || exerciseState === 'OPEN') {
      return 'warn';
    }
    return 'bad';
  }, [exerciseState]);

  return (
    <div className="page-container workout-page">
      <div className="container">
        <div className="page-header flex-between">
          <div>
            <h1>
              Workout <span className="text-gradient">Camera</span>
            </h1>
            <p>Integrated ExerciseActivity pose model with live rep counting and form feedback.</p>
          </div>
          <div className="session-controls">
            <button className="btn btn-secondary" onClick={togglePauseSession} disabled={!isCameraOn}>
              {isPaused ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button className="btn btn-danger" onClick={endSession}>
              <StopCircle size={18} /> End Session
            </button>
          </div>
        </div>

        {error && <div className="workout-error">{error}</div>}

        <div className="workout-layout split-layout">
          <div className="workout-camera-column">
            <div className="webcam-frame glass-card">
              <div className="webcam-header">
                <div className={`recording-dot ${isCameraOn && !isPaused ? 'pulse' : ''}`}></div>
                <span>{statusText}</span>
              </div>

              <div className="webcam-view">
                <video ref={videoRef} className="input-video" playsInline muted />
                <canvas ref={canvasRef} className="output-canvas" width={640} height={480} />

                {!isCameraOn && (
                  <div className="camera-overlay">
                    <Camera size={46} />
                    <p>Camera is off</p>
                  </div>
                )}
              </div>

              <div className="workout-control-row">
                {!isCameraOn ? (
                  <button className="btn btn-primary" onClick={startCamera} disabled={!scriptsReady}>
                    <Camera size={18} /> Camera On
                  </button>
                ) : (
                  <button className="btn btn-danger" onClick={stopCamera}>
                    <StopCircle size={18} /> Camera Off
                  </button>
                )}

                <button className="btn btn-secondary" onClick={resetWorkoutState}>
                  <RefreshCw size={18} /> Reset Stats
                </button>
              </div>
            </div>

            <div className="live-feed glass-card">
              <div className="feed-header">
                <h4>AI Event Log</h4>
                <button className="btn-icon" onClick={clearEventLog}>
                  <RefreshCw size={14} />
                </button>
              </div>
              <ul className="log-list">
                {eventLog.length === 0 ? (
                  <li className="log-item info">
                    <Activity size={16} /> <span>No events yet. Start camera to begin.</span>
                  </li>
                ) : (
                  eventLog.map((item, index) => (
                    <li key={`${item.time}-${index}`} className={`log-item ${item.type}`}>
                      <Activity size={16} />
                      <span>{item.message}</span>
                      <small>{item.time}</small>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="workout-metrics">
            <div className="exercise-selector-box glass-card full-width">
              <span className="box-label">Current Exercise</span>
              <div className="exercise-buttons">
                <button
                  className={`exercise-btn ${currentExercise === 'squat' ? 'active' : ''}`}
                  onClick={() => setCurrentExercise('squat')}
                >
                  <img className="exercise-icon-image" src={squatImage} alt="Squat" />
                  <span>Squat</span>
                </button>
                <button
                  className={`exercise-btn ${currentExercise === 'pushup' ? 'active' : ''}`}
                  onClick={() => setCurrentExercise('pushup')}
                >
                  <img className="exercise-icon-image" src={pushupImage} alt="Push-Up" />
                  <span>Push-Up</span>
                </button>
                <button
                  className={`exercise-btn ${currentExercise === 'jumpingJack' ? 'active' : ''}`}
                  onClick={() => setCurrentExercise('jumpingJack')}
                >
                  <img className="exercise-icon-image" src={jumpingJackImage} alt="Jumping Jack" />
                  <span>Jumping Jack</span>
                </button>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-box glass-card">
                <span className="box-label">Exercise State</span>
                <span className={`box-value ${exerciseStateClass}`}>{exerciseState}</span>
              </div>
              <div className="metric-box glass-card">
                <span className="box-label">Current Reps</span>
                <span className="box-value text-gradient">{exerciseReps}</span>
              </div>
              <div className="metric-box glass-card">
                <span className="box-label">Correct Reps / Accuracy</span>
                <span className="box-value small-text">{accuracyText}</span>
              </div>
              <div className="metric-box glass-card">
                <span className="box-label">Fitness Score</span>
                <span className="box-value text-gradient">{fitnessScore}</span>
              </div>
              <div className="metric-box glass-card">
                <span className="box-label">Total Time</span>
                <span className="box-value small-text">{totalTime}</span>
              </div>
              <div className="metric-box glass-card">
                <span className="box-label">Active Time</span>
                <span className="box-value small-text">{activeTime}</span>
              </div>
            </div>

            <div className="live-feed glass-card">
              <div className="feed-header">
                <h4>Real-time Form Analysis</h4>
              </div>
              <p className="feedback-text">{feedbackText}</p>
              <p className="metric-text">{metricText}</p>
            </div>

            <div className="live-feed glass-card">
              <div className="feed-header">
                <h4>Reps by Exercise</h4>
              </div>
              <ul className="per-exercise-list">
                {perExercise.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <span>{item.reps} reps, {item.accuracy}%</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCam;
