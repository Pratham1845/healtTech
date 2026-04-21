const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const FALLBACK_MESSAGE = 'Unable to fetch response. Try basic exercises like stretching and posture correction';

export const generateFitnessReply = async (inputOrPayload, maybeHealthData) => {
  try {
    const queryText = typeof inputOrPayload === 'string' ? inputOrPayload : inputOrPayload?.userInput;
    const contextData = typeof inputOrPayload === 'string' ? maybeHealthData : inputOrPayload?.healthData;

    if (!queryText || !queryText.trim()) {
      return 'Please type your question so I can help with a short fitness plan.';
    }

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userInput: queryText,
        healthData: contextData ?? {}
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return data?.error || data?.message || FALLBACK_MESSAGE;
    }

    return data?.text || FALLBACK_MESSAGE;
  } catch (error) {
    return FALLBACK_MESSAGE;
  }
};

export const fetchChatHistory = async (limit = 50) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/history?limit=${limit}`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};
