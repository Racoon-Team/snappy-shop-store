import requests from './httpServices';

const ChatServices = {
  sendMessage: async ({ sessionId, message }) => {
    return requests.post('/chat', {
      session_id: sessionId,
      message,
    });
  },
};

export default ChatServices;
