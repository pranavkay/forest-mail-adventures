
// This is a simplified Gmail service for prototyping purposes
// In a real application, you would need to handle token refresh,
// error handling, pagination, etc.

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

interface ForestEmail {
  id: string;
  from: {
    id: string;  // Added to match Contact interface
    name: string;
    email: string;
    woodlandName: string;
    animal: string;
    avatar: string;  // Added to match Contact interface
  };
  subject: string;
  body: string;
  received: string;
  read: boolean;
}

export const fetchEmails = async (token: string): Promise<ForestEmail[]> => {
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
const mockTransformGmailData = (gmailEmails: GmailEmail[]): ForestEmail[] => {
  // In a real application, this would transform Gmail API data
  // to match our ForestEmail format
  
  // For now, we'll return mock data that matches our existing format
  return [
    {
      id: 'g1',
      from: {
        id: 'gmail-user-1',  // Added id field to match Contact interface
        name: 'Gmail User',
        email: 'gmail@gmail.com',
        woodlandName: 'Gentle Deer',
        animal: 'fox',
        avatar: '/avatar-fox.png'  // Added avatar field to match Contact interface
      },
      subject: 'Welcome to Gmail Forest Integration',
      body: 'This is a sample email to demonstrate Gmail integration with Forest Mail.',
      received: new Date().toISOString(),
      read: false
    }
  ];
};
