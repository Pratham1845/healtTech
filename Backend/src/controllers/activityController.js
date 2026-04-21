const asyncHandler = require('express-async-handler');
const ActivitySession = require('../models/ActivitySession');

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const createActivitySession = asyncHandler(async (req, res) => {
  const payload = req.body || {};

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
    fitnessScore: normalizeNumber(payload.fitnessScore),
    postureScore: payload.postureScore === null || payload.postureScore === undefined ? null : normalizeNumber(payload.postureScore),
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

  const validPostures = sessions
    .map((item) => (item.postureScore === null || item.postureScore === undefined ? null : normalizeNumber(item.postureScore)))
    .filter((value) => value !== null);
  const postureScore = validPostures.length > 0 ? Math.round(validPostures.reduce((sum, item) => sum + item, 0) / validPostures.length) : null;

  const latestSession = sessions[totalSessions - 1] || null;
  const moodStatus = latestSession?.mood || 'Neutral';

  const daySet = new Set(
    sessions.map((item) => {
      const d = new Date(item.createdAt);
      return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
    })
  );
  const consistency = Math.round((daySet.size / days) * 100);

  let riskLevel = 'Low';
  if (postureScore !== null && postureScore < 50) {
    riskLevel = 'High';
  } else if (postureScore !== null && postureScore < 70) {
    riskLevel = 'Medium';
  }

  const seriesByDay = new Map();
  for (const item of sessions) {
    const key = new Date(item.createdAt).toISOString().slice(0, 10);
    if (!seriesByDay.has(key)) {
      seriesByDay.set(key, {
        activityMinutes: 0,
        moodScoreTotal: 0,
        moodCount: 0,
        healthScoreTotal: 0,
        healthCount: 0,
        calories: 0,
        workouts: 0
      });
    }

    const bucket = seriesByDay.get(key);
    bucket.activityMinutes += Math.round(normalizeNumber(item.activeSeconds) / 60);
    bucket.workouts += 1;

    const health = normalizeNumber(item.fitnessScore);
    if (health > 0) {
      bucket.healthScoreTotal += health;
      bucket.healthCount += 1;
    }

    const posture = item.postureScore === null || item.postureScore === undefined ? null : normalizeNumber(item.postureScore);
    if (posture !== null) {
      bucket.moodScoreTotal += posture;
      bucket.moodCount += 1;
    }

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
    postureScore,
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
