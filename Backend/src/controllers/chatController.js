const asyncHandler = require('express-async-handler');
const ChatMessage = require('../models/ChatMessage');
const ActivitySession = require('../models/ActivitySession');
const User = require('../models/User');

const FALLBACK_MESSAGE = 'Unable to fetch response. Try basic exercises like stretching and posture correction';

const calculateHealthScore = async (userId) => {
  const days = 30;
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  const sessions = await ActivitySession.find({
    user: userId,
    createdAt: { $gte: start }
  }).sort({ createdAt: 1 }).lean();

  if (sessions.length === 0) {
    return 70;
  }

  const totalSessions = sessions.length;
  const totalActiveSeconds = sessions.reduce((sum, item) => sum + (Number(item.activeSeconds) || 0), 0);
  
  const avgFitnessScore = Math.round(
    sessions.reduce((sum, item) => sum + (Number(item.fitnessScore) || 0), 0) / totalSessions
  );

  const latestSession = sessions[sessions.length - 1];
  const latestHealthScore = Number(latestSession.healthScore) || 70;

  const postureScores = sessions
    .filter((s) => s.postureScore !== null && s.postureScore !== undefined)
    .map((s) => Number(s.postureScore));
  
  const postureScore = postureScores.length > 0
    ? Math.round(postureScores.reduce((sum, val) => sum + val, 0) / postureScores.length)
    : 70;

  const sleepScores = sessions
    .filter((s) => s.sleep?.score !== null && s.sleep?.score !== undefined)
    .map((s) => Number(s.sleep.score));
  
  const avgSleepScore = sleepScores.length > 0
    ? Math.round(sleepScores.reduce((sum, val) => sum + val, 0) / sleepScores.length)
    : null;

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

  const emotionScores = sessions.map((item) => {
    if (item.emotion?.dominant) {
      return emotionToScore(item.emotion.dominant);
    }
    return moodToScore(item.mood);
  });
  
  const avgEmotionScore = Math.round(
    emotionScores.reduce((sum, val) => sum + val, 0) / emotionScores.length
  );

  const activityScore = Math.min(100, Math.round((totalActiveSeconds / 60 / 150) * 100));

  const weightedInputs = [
    { value: avgFitnessScore, weight: 0.35 },
    { value: postureScore, weight: 0.2 },
    { value: avgSleepScore ?? 70, weight: 0.2 },
    { value: avgEmotionScore, weight: 0.15 },
    { value: activityScore, weight: 0.1 }
  ].filter((item) => item.value !== null && item.value !== undefined);

  const weightTotal = weightedInputs.reduce((sum, item) => sum + item.weight, 0) || 1;
  const healthScore = Math.round(
    weightedInputs.reduce((sum, item) => sum + item.value * item.weight, 0) / weightTotal
  );

  return Math.min(100, Math.max(0, healthScore));
};

const buildPrompt = (userInput, contextData) => {
  return [
    'You are a fitness and health AI coach for HealthTech app users.',
    'Use the provided user metrics to personalize the advice.',
    'Give short practical advice in 3-5 lines only.',
    'Respond in the same language as user (Hindi or English).',
    '',
    'User Health Data:',
    `- Health Score: ${contextData.healthScore ?? 'Unknown'}`,
    `- Posture Score: ${contextData.postureScore ?? 'Unknown'}`,
    `- Sleep Score: ${contextData.sleepScore ?? 'Unknown'}`,
    `- Activity Level: ${contextData.activityLevel ?? 'Unknown'}`,
    `- Mood: ${contextData.mood ?? 'Unknown'}`,
    `- Active Minutes (7d): ${contextData.totalActiveMinutes ?? 'Unknown'}`,
    '',
    `User Query: ${userInput}`,
    '',
    'Instruction: Include workout recommendation, sleep guidance, recovery tips, and progression guidance in concise form.'
  ].join('\n');
};

const callGemini = async (userInput, contextData) => {
  if (!process.env.GEMINI_API_KEY) {
    return {
      text: FALLBACK_MESSAGE,
      status: 'fallback',
      error: 'GEMINI_API_KEY is missing in backend environment'
    };
  }

  const modelCandidates = [
    process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    'gemini-2.0-flash-lite-001'
  ];

  const prompt = buildPrompt(userInput, contextData);
  let bestErrorCode = null;

  for (const modelName of modelCandidates) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 220
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      const shortReply = text.split('\n').slice(0, 5).join('\n').trim();

      return {
        text: shortReply || FALLBACK_MESSAGE,
        status: 'success',
        error: null
      };
    }

    bestErrorCode = response.status;

    if (response.status === 404 || response.status === 429) {
      continue;
    }

    break;
  }

  const errorMessage =
    bestErrorCode === 401 || bestErrorCode === 403
      ? 'Gemini API key is invalid or restricted'
      : bestErrorCode === 429
      ? 'Gemini quota exceeded, retry later'
      : FALLBACK_MESSAGE;

  return {
    text: FALLBACK_MESSAGE,
    status: 'fallback',
    error: errorMessage
  };
};

const generateChatReply = asyncHandler(async (req, res) => {
  const { userInput, healthData } = req.body;

  if (!userInput || typeof userInput !== 'string') {
    res.status(400);
    throw new Error('userInput is required');
  }

  const contextData = healthData ?? {};
  
  const calculatedHealthScore = await calculateHealthScore(req.user._id);
  
  await User.findByIdAndUpdate(req.user._id, {
    healthScore: calculatedHealthScore
  });

  const result = await callGemini(userInput, { ...contextData, healthScore: calculatedHealthScore });

  const savedMessage = await ChatMessage.create({
    user: req.user._id,
    userInput,
    botReply: result.text,
    healthData: {
      postureScore: contextData.postureScore ?? null,
      activityLevel: contextData.activityLevel ?? 'Unknown',
      mood: contextData.mood ?? 'Unknown',
      healthScore: calculatedHealthScore
    },
    status: result.status
  });

  res.status(200).json({
    _id: savedMessage._id,
    sender: 'bot',
    text: result.text,
    status: result.status,
    error: result.error,
    healthScore: calculatedHealthScore,
    createdAt: savedMessage.createdAt
  });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const history = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(limit).lean();

  res.json(
    history.map((item) => ({
      _id: item._id,
      userInput: item.userInput,
      botReply: item.botReply,
      healthData: item.healthData,
      status: item.status,
      createdAt: item.createdAt
    }))
  );
});

module.exports = {
  generateChatReply,
  getChatHistory
};
