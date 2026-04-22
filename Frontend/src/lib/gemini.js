import { apiFetch } from './api';

const FALLBACK_MESSAGE = 'Unable to fetch response. Try basic exercises like stretching and posture correction';

export const generateFitnessReply = async (inputOrPayload, maybeHealthData) => {
  try {
    const queryText = typeof inputOrPayload === 'string' ? inputOrPayload : inputOrPayload?.userInput;
    const contextData = typeof inputOrPayload === 'string' ? maybeHealthData : inputOrPayload?.healthData;

    if (!queryText || !queryText.trim()) {
      return { text: 'Please type your question so I can help with a short fitness plan.', healthScore: null };
    }

    const data = await apiFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        userInput: queryText,
        healthData: contextData ?? {}
      })
    });

    return {
      text: data?.text || FALLBACK_MESSAGE,
      healthScore: data?.healthScore ?? null
    };
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Re-throw authentication errors so they can trigger redirect
    if (error.isAuthError || error.status === 401) {
      throw error;
    }
    
    return { text: FALLBACK_MESSAGE, healthScore: null };
  }
};

export const fetchChatHistory = async (limit = 50) => {
  try {
    const data = await apiFetch(`/api/chat/history?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    
    // Re-throw authentication errors so they can trigger redirect
    if (error.isAuthError || error.status === 401) {
      throw error;
    }
    
    return [];
  }
};
