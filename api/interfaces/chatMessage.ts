export interface ChatMessage {
  id: string;
  serviceRequestId: string;

  senderId: string;
  senderRole: 'USER' | 'DRIVER' | 'PROVIDER' | 'ADMIN';

  message: string;

  createdAt: string; // ISO date
}