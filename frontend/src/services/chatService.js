import { apiRequest } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Vault Assistant API Service
 * Interacts directly with FastAPI /api/v1/chat endpoints.
 */

// 1. Send message to AI Agent (Standard JSON response)
export async function sendChatMessage(message, sessionId = null) {
  return await apiRequest('/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  });
}

// 2. Real-time streaming consumer (ChatGPT-style word-by-word streaming)
export async function streamChatMessage({
  message,
  sessionId = null,
  onToken,
  onComplete,
  onError,
}) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let completed = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep partial line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'token' && onToken) {
              onToken(data.token);
            } else if (data.type === 'done' && onComplete) {
              completed = true;
              onComplete(data);
            }
          } catch (e) {
            console.error('Error parsing SSE event:', e);
          }
        }
      }
    }

    // Safety fallback: ensure loading spinner never hangs if stream finishes
    if (!completed && onComplete) {
      onComplete({
        session_id: sessionId,
        document_references: [],
        action_chips: [],
      });
    }
  } catch (err) {
    if (onError) onError(err);
    else console.error('Streaming error:', err);
  }
}

// 3. Fetch all conversation threads for sidebar
export async function getChatSessions() {
  return await apiRequest('/chat/sessions', {
    method: 'GET',
  });
}

// 4. Load all messages in a specific conversation thread
export async function getSessionMessages(sessionId) {
  return await apiRequest(`/chat/sessions/${sessionId}/messages`, {
    method: 'GET',
  });
}

// 5. Delete a single chat session
export async function deleteChatSession(sessionId) {
  return await apiRequest(`/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}

// 6. Clear all conversation threads
export async function clearAllChatSessions() {
  return await apiRequest('/chat/sessions', {
    method: 'DELETE',
  });
}

// 7. Fetch dynamic prompt suggestions
export async function getChatSuggestions() {
  return await apiRequest('/chat/suggestions', {
    method: 'GET',
  });
}

