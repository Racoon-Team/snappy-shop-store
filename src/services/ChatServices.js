const CHAT_API_URL = 'http://localhost:5055/api/chat';

export async function sendChatMessage({ sessionId, message }) {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error('Error al comunicarse con el servicio de chat');
  }

  return response.json();
}
