import { ChatMessage } from '../interfaces/chatMessage';

//const API_URL = import.meta.env.VITE_API_URL;


export const ChatService = {
  getMessages: async (serviceRequestId: string): Promise<ChatMessage[]> => {
    const res = await fetch(
      `/service-requests/${serviceRequestId}/chat`
    );
    return res.json();
  },

  sendMessage: async (
    serviceRequestId: string,
    message: string
  ): Promise<ChatMessage> => {
    const res = await fetch(
      `/service-requests/${serviceRequestId}/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }
    );

    return res.json();
  },
};
