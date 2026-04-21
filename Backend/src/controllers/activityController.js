const asyncHandler = require('express-async-handler');
const ActivitySession = require('../models/ActivitySession');

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const moodToScore = (mood) => {
  const key = String(mood || '').toLowerCase();
  if (['happy', 'focused', 'calm', 'energized', 'good'].includes(key)) return 85;
  if (['neutral', 'ok', 'normal'].includes(key)) return 70;
  if (['stressed', 'tired', 'anxious'].includes(key)) return 55;
  if (['sad', 'angry', 'fearful', 'disgusted', 'bad'].includes(key)) return 45;
  return 65;
};

const emotionToScore = (emotion) => {
  const key = String(emotion || '').toLowerCase();
  const map = {
    happy: 90,
    neutral: 72,
    surprised: 78,
    sad: 52,
    fearful: 48,
    angry: 42,
    disgusted: 40
  };
  return map[key] ?? 65;
};

const computeActivityScore = (durationSeconds, activeSeconds, activityLevel) => {
  const duration = normalizeNumber(durationSeconds);
  const active = normalizeNumber(activeSeconds);
  if (duration <= 0 && active <= 0) {
    const fallbackMap = { high: 85, moderate: 70, low: 55 };
    return fallbackMap[String(activityLevel || '').toLowerCase()] ?? 60;
  }

  const ratio = duration > 0 ? active / duration : 0;
  const ratioScore = clamp(ratio * 100);
  const durationBonus = clamp((duration / 1800) * 20, 0, 20);
  return clamp(ratioScore * 0.8 + durationBonus);
};

const computeDerivedScores = (payload) => {
  const posture =
    payload.postureScore === null || payload.postureScore === undefined
      ? null
      : clamp(normalizeNumber(payload.postureScore));

  const accuracy = clamp(normalizeNumber(payload.accuracy));
  const fitnessBase = clamp(normalizeNumber(payload.fitnessScore));
  const fitness = fitnessBase > 0 ? fitnessBase : accuracy > 0 ? accuracy : posture ?? 0;

  const sleepScore =
    payload.sleep?.score === null || payload.sleep?.score === undefined
      ? null
      : clamp(normalizeNumber(payload.sleep.score));

  const emotionScore = payload.emotion?.dominant
    ? emotionToScore(payload.emotion.dominant)
    : moodToScore(payload.mood);

  const activityScore = computeActivityScore(payload.durationSeconds, payload.activeSeconds, payload.activityLevel);

  const weightedInputs = [
    { value: fitness > 0 ? fitness : null, weight: 0.35 },
    { value: posture, weight: 0.2 },
    { value: sleepScore, weight: 0.2 },
    { value: emotionScore, weight: 0.15 },
    { value: activityScore, weight: 0.1 }
  ].filter((item) => item.value !== null && item.value !== undefined);

  const weightTotal = weightedInputs.reduce((sum, item) => sum + item.weight, 0) || 1;
  const healthScore = Math.round(
    weightedInputs.reduce((sum, item) => sum + item.value * item.weight, 0) / weightTotal
  );

  return {
    fitnessScore: Math.round(fitness),
    postureScore: posture,
    sleepScore,
    emotionScore,
    activityScore: Math.round(activityScore),
    healthScore: clamp(healthScore)
  };
};

const createActivitySession = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const derived = computeDerivedScores(payload);

  const session = await ActivitySession.create({
    user: req.user._id,
    source: payload.source || 'manual',
    sessionStartedAt: payload.sessionStartedAt || new Date(),
    sessionEndedAt: payload.sessionEndedAt || new Date(),
    durationSeconds: normalizeNumber(payload.durationSeconds),
    activeSeconds: normalizeNumber(payload.activeSeconds),
    totalReps: normalizeNumber(payload.totalReps),
    correctReps: normalizeNumber(payload.correctReps),
    accuracy: normalizeNumber(payload.accuracy),
    fitnessScore: derived.fitnessScore,
    healthScore: derived.healthScore,
    postureScore: derived.postureScore,
    mood: payload.mood || 'Neutral',
    activityLevel: payload.activityLevel || 'Low',
    sleep: {
      hours: payload.sleep?.hours === undefined ? null : normalizeNumber(payload.sleep.hours),
      quality: payload.sleep?.quality === undefined ? null : normalizeNumber(payload.sleep.quality),
      score: payload.sleep?.score === undefined ? null : normalizeNumber(payload.sleep.score)
    },
    emotion: {
      dominant: payload.emotion?.dominant || null,
      confidence: payload.emotion?.confidence === undefined ? null : normalizeNumber(payload.emotion.confidence),
      counts: payload.emotion?.counts || null
    },
    exerciseBreakdown: Array.isArray(payload.exerciseBreakdown)
      ? payload.exerciseBreakdown.map((item) => ({
          name: item?.name || 'Exercise',
          reps: normalizeNumber(item?.reps),
          accuracy: normalizeNumber(item?.accuracy)
        }))
      : [],
    notes: payload.notes || '',
    metadata: payload.metadata || null
  });

  res.status(201).json({
    _id: session._id,
    healthScore: session.healthScore,
    createdAt: session.createdAt
  });
});

const getActivityHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 300);
  const history = await ActivitySession.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(limit).lean();
  res.json(history);
});

const getActivitySummary = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  const sessions = await ActivitySession.find({
    user: req.user._id,
    createdAt: { $gte: start }
  })
    .sort({ createdAt: 1 })
    .lean();

  const totalSessions = sessions.length;
  const totalActiveSeconds = sessions.reduce((sum, item) => sum + normalizeNumber(item.activeSeconds), 0);
  const totalDurationSeconds = sessions.reduce((sum, item) => sum + normalizeNumber(item.durationSeconds), 0);
  const totalReps = sessions.reduce((sum, item) => sum + normalizeNumber(item.totalReps), 0);

  const avgFitnessScore =
    totalSessions > 0
      ? Math.round(sessions.reduce((sum, item) => sum + normalizeNumber(item.fitnessScore), 0) / totalSessions)
      : 0;

  const avgHealthScore =
    totalSessions > 0
      ? Math.round(
          sessions.reduce(
            (sum, item) => sum + normalizeNumber(item.healthScore, normalizeNumber(item.fitnessScore)),
            0
          ) / totalSessions
        )
      : 0;

  const latestSession = sessions[totalSessions - 1] || null;
  const latestHealthScore = latestSession
    ? Math.round(normalizeNumber(latestSession.healthScore, normalizeNumber(latestSession.fitnessScore)))
    : 0;

  const validPostures = sessions
    .map((item) => (item.postureScore === null || item.postureScore === undefined ? null : normalizeNumber(item.postureScore)))
    .filter((value) => value !== null);
  const postureScore = validPostures.length > 0 ? Math.round(validPostures.reduce((sum, item) => sum + item, 0) / validPostures.length) : null;

  const sleepScores = sessions
    .map((item) => (item.sleep?.score === null || item.sleep?.score === undefined ? null : normalizeNumber(item.sleep.score)))
    .filter((value) => value !== null);
  const avgSleepScore = sleepScores.length > 0 ? Math.round(sleepScores.reduce((sum, item) => sum + item, 0) / sleepScores.length) : null;

  const moodStatus = latestSession?.mood || (latestSession?.emotion?.dominant ? latestSession.emotion.dominant : 'Neutral');

  const daySet = new Set(
    sessions.map((item) => {
      const d = new Date(item.createdAt);
      return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
    })
  );
  const consistency = Math.round((daySet.size / days) * 100);

  let riskLevel = 'Low';
  if (latestHealthScore < 50) {
    riskLevel = 'High';
  } else if (latestHealthScore < 70) {
    riskLevel = 'Medium';
  }

  const seriesByDay = new Map();
  for (const item of sessions) {
    const key = new Date(item.createdAt).toISOString().slice(0, 10);
    if (!seriesByDay.has(key)) {
      seriesByDay.set(key, {
        moodScoreTotal: 0,
        moodCount: 0,
        healthScoreTotal: 0,
        healthCount: 0,
        calories: 0,
        workouts: 0
      });
    }

    const bucket = seriesByDay.get(key);
    bucket.workouts += 1;

    const health = normalizeNumber(item.healthScore, normalizeNumber(item.fitnessScore));
    if (health > 0) {
      bucket.healthScoreTotal += health;
      bucket.healthCount += 1;
    }

    const moodNumeric = item.emotion?.dominant ? emotionToScore(item.emotion.dominant) : moodToScore(item.mood);
    bucket.moodScoreTotal += moodNumeric;
    bucket.moodCount += 1;

    bucket.calories += Math.round(normalizeNumber(item.activeSeconds) * 0.11);
  }

  const keys = [...seriesByDay.keys()].sort();
  const moodTrend = [];
  const healthScoreTrend = [];
  const weeklyWorkouts = [];
  const caloriesTrend = [];

  for (const key of keys) {
    const row = seriesByDay.get(key);
    moodTrend.push(row.moodCount > 0 ? Math.round(row.moodScoreTotal / row.moodCount) : 0);
    healthScoreTrend.push(row.healthCount > 0 ? Math.round(row.healthScoreTotal / row.healthCount) : 0);
    weeklyWorkouts.push(row.workouts);
    caloriesTrend.push(row.calories);
  }

  const postureBreakdown = { perfect: 0, slight: 0, risk: 0 };
  for (const value of validPostures) {
    if (value >= 85) {
      postureBreakdown.perfect += 1;
    } else if (value >= 60) {
      postureBreakdown.slight += 1;
    } else {
      postureBreakdown.risk += 1;
    }
  }

  const postureTotal = validPostures.length || 1;
  const posturePercentages = {
    perfect: Math.round((postureBreakdown.perfect / postureTotal) * 100),
    slight: Math.round((postureBreakdown.slight / postureTotal) * 100),
    risk: Math.round((postureBreakdown.risk / postureTotal) * 100)
  };

  res.json({
    days,
    totalSessions,
    totalReps,
    totalActiveMinutes: Math.round(totalActiveSeconds / 60),
    totalDurationMinutes: Math.round(totalDurationSeconds / 60),
    avgFitnessScore,
    avgHealthScore,
    latestHealthScore,
    postureScore,
    avgSleepScore,
    consistency,
    moodStatus,
    riskLevel,
    trends: {
      labels: keys,
      weeklyWorkouts,
      moodTrend,
      healthScoreTrend,
      caloriesTrend,
      postureBreakdown: posturePercentages
    },
    recentSessions: sessions.slice(-10).reverse()
  });
});

module.exports = {
  createActivitySession,
  getActivityHistory,
  getActivitySummary
};
