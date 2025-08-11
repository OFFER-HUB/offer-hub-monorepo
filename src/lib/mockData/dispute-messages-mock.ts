export interface DisputeMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: 'client' | 'freelancer' | 'admin';
  };
  isOutgoing: boolean;
  type: 'text' | 'file';
  fileData?: {
    name: string;
    size: string;
    uploadDate: string;
    status: string;
  };
}

export const mockDisputeMessages: DisputeMessage[] = [
  {
    id: 'msg-001',
    content: 'The main text of the message sent out',
    timestamp: '09:23 am',
    sender: {
      id: 'client-001',
      name: 'John Smith',
      avatar: '/person2.png',
      role: 'client'
    },
    isOutgoing: false,
    type: 'text'
  },
  {
    id: 'msg-002',
    content: 'The main text of the message sent out',
    timestamp: '09:21 am',
    sender: {
      id: 'freelancer-001',
      name: 'Sarah Johnson',
      avatar: '/person1.png',
      role: 'freelancer'
    },
    isOutgoing: true,
    type: 'text'
  }
];

export const getMessagesByDisputeId = (disputeId: string): DisputeMessage[] => {
  // In a real app, this would filter by dispute ID
  return mockDisputeMessages;
};

export const addMessage = (disputeId: string, content: string, senderId: string): DisputeMessage => {
  const newMessage: DisputeMessage = {
    id: `msg-${Date.now()}`,
    content,
    timestamp: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    sender: {
      id: senderId,
      name: 'Current User',
      avatar: '/person1.png',
      role: 'client'
    },
    isOutgoing: true,
    type: 'text'
  };

  mockDisputeMessages.push(newMessage);
  return newMessage;
};