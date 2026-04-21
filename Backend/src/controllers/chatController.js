const asyncHandler = require('express-async-handler');
const ChatMessage = require('../models/ChatMessage');

const FALLBACK_MESSAGE = 'Unable to fetch response. Try basic exercises like stretching and posture correction';

const buildPrompt = (userInput, contextData) => {
  return [
    'You are a fitness and health AI coach for HealthTech app users.',
    'Use the provided user metrics to personalize the advice.',
    'Give short practical advice in 3-5 lines only.',
    'Respond in the same language as user (Hindi or English).',
    '',
    'User Health Data:',
    `- Posture Score: ${contextData.postureScore ?? 'Unknown'}`,
    `- Activity Level: ${contextData.activityLevel ?? 'Unknown'}`,
    `- Mood: ${contextData.mood ?? 'Unknown'}`,
    '',
    `User Query: ${userInput}`,
    '',
    'Instruction: Include workout recommendation, injury prevention, and progression guidance in concise form.'
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
  const result = await callGemini(userInput, contextData);

  const savedMessage = await ChatMessage.create({
    userInput,
    botReply: result.text,
    healthData: {
      postureScore: contextData.postureScore ?? null,
      activityLevel: contextData.activityLevel ?? 'Unknown',
      mood: contextData.mood ?? 'Unknown'
    },
    status: result.status
  });

  res.status(result.status === 'success' ? 200 : 502).json({
    _id: savedMessage._id,
    sender: 'bot',
    text: result.text,
    status: result.status,
    error: result.error,
    createdAt: savedMessage.createdAt
  });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const history = await ChatMessage.find().sort({ createdAt: -1 }).limit(limit).lean();

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
