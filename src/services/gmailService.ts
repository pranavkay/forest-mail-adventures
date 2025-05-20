
// This is a simplified Gmail service for prototyping purposes
// In a real application, you would need to handle token refresh,
// error handling, pagination, etc.

import { Email, Contact } from '@/data/mockData';

interface GmailEmail {
  id: string;
  snippet: string;
  payload: {
    headers: {
      name: string;
      value: string;
    }[];
    parts?: {
      mimeType: string;
      body: {
        data: string;
      };
    }[];
    body?: {
      data: string;
    };
  };
  labelIds: string[];
  internalDate: string;
}

// Using the Email type from mockData to ensure compatibility
export const fetchEmails = async (token: string): Promise<Email[]> => {
  try {
    // In a real implementation, you would:
    // 1. Use the token to fetch emails from Gmail API
    // 2. Transform the Gmail data to ForestEmail format
    
    // For now, we'll return mock data
    console.log('Using token to fetch emails:', token);
    
    return mockTransformGmailData([]);
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

export const sendEmail = async (token: string, email: any): Promise<boolean> => {
  try {
    // In a real implementation, you would:
    // 1. Use the token to send an email via Gmail API
    
    console.log('Using token to send email:', token, email);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Helper functions
const mockTransformGmailData = (gmailEmails: GmailEmail[]): Email[] => {
  // In a real application, this would transform Gmail API data
  // to match our ForestEmail format
  
  // For now, we'll return mock data that matches our existing format
  return [
    {
      id: 'g1',
      from: {
        id: 'gmail-user-1',
        name: 'Gmail User',
        email: 'gmail@gmail.com',
        woodlandName: 'Gentle Deer',
        animal: 'fox', // Using a valid animal type from the union
        avatar: '/avatar-fox.png'
      },
      subject: 'Welcome to Gmail Forest Integration',
      body: 'This is a sample email to demonstrate Gmail integration with Forest Mail.',
      received: new Date().toISOString(),
      read: false
    }
  ];
};
