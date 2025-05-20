
// This is a Gmail service implementation using the Google API
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

// Fetch emails from Gmail API
export const fetchEmails = async (token: string): Promise<Email[]> => {
  try {
    // Get list of emails from Gmail API
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Gmail API error:', errorDetails);
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.messages || !Array.isArray(data.messages)) {
      console.log('No messages found in Gmail account');
      return [];
    }

    // Fetch details for each email
    const emailDetailsPromises = data.messages.map(async (message: { id: string }) => {
      const detailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!detailResponse.ok) {
        console.error(`Failed to fetch details for email ${message.id}`);
        return null;
      }
      
      return await detailResponse.json();
    });

    const emailDetails = await Promise.all(emailDetailsPromises);
    const validEmails = emailDetails.filter(email => email !== null) as GmailEmail[];
    
    return transformGmailData(validEmails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    // Return mock data as fallback
    return mockTransformGmailData([]);
  }
};

export const sendEmail = async (token: string, email: any): Promise<boolean> => {
  try {
    // Create the email in RFC 2822 format
    const emailContent = [
      `From: ${email.from}`,
      `To: ${email.to}`,
      `Subject: ${email.subject}`,
      '',
      email.body
    ].join('\r\n');

    // Encode the email to base64
    const encodedEmail = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email via Gmail API
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Gmail API error:', errorDetails);
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Helper functions
const transformGmailData = (gmailEmails: GmailEmail[]): Email[] => {
  return gmailEmails.map(email => {
    // Extract email details from headers
    const headers = email.payload.headers || [];
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown';
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
    const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();
    
    // Extract email content
    let body = '';
    if (email.payload.parts && email.payload.parts.length > 0) {
      // If email has parts (multipart email)
      const textPart = email.payload.parts.find(part => part.mimeType === 'text/plain');
      if (textPart && textPart.body.data) {
        body = decodeBase64UrlSafe(textPart.body.data);
      }
    } else if (email.payload.body && email.payload.body.data) {
      // Simple email format
      body = decodeBase64UrlSafe(email.payload.body.data);
    }

    // Parse sender name and email
    const fromMatch = from.match(/(.+) <(.+)>/);
    const fromName = fromMatch ? fromMatch[1] : from;
    const fromEmail = fromMatch ? fromMatch[2] : from;

    return {
      id: email.id,
      from: {
        id: `gmail-${email.id}`,
        name: fromName,
        email: fromEmail,
        woodlandName: getRandomWoodlandName(),
        animal: getRandomAnimal(),
        avatar: `/avatar-fox.png`
      },
      subject,
      body: body || email.snippet || '(No content)',
      received: new Date(parseInt(email.internalDate)).toISOString(),
      read: !email.labelIds.includes('UNREAD')
    };
  });
};

// Helper function to decode base64 URL safe encoding
const decodeBase64UrlSafe = (data: string): string => {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (error) {
    console.error('Error decoding email content:', error);
    return '';
  }
};

// Random woodland name generator (for fun!)
const getRandomWoodlandName = (): string => {
  const adjectives = ['Gentle', 'Wise', 'Swift', 'Clever', 'Nimble', 'Quiet', 'Brave'];
  const animals = ['Deer', 'Fox', 'Rabbit', 'Owl', 'Squirrel', 'Wolf', 'Bear'];
  
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  
  return `${randomAdj} ${randomAnimal}`;
};

// Random animal generator for avatar
const getRandomAnimal = (): 'fox' | 'rabbit' | 'owl' | 'squirrel' | 'cat' | 'dog' | 'bird' => {
  const animals = ['fox', 'rabbit', 'owl', 'squirrel', 'cat', 'dog', 'bird'];
  return animals[Math.floor(Math.random() * animals.length)] as 'fox' | 'rabbit' | 'owl' | 'squirrel' | 'cat' | 'dog' | 'bird';
};

// Fallback to mock data if needed
const mockTransformGmailData = (gmailEmails: GmailEmail[]): Email[] => {
  console.log('Using mock Gmail data as fallback');
  return [
    {
      id: 'g1',
      from: {
        id: 'gmail-user-1',
        name: 'Gmail User',
        email: 'gmail@gmail.com',
        woodlandName: 'Gentle Deer',
        animal: 'fox',
        avatar: '/avatar-fox.png'
      },
      subject: 'Welcome to Gmail Forest Integration',
      body: 'This is a sample email to demonstrate Gmail integration with Forest Mail.',
      received: new Date().toISOString(),
      read: false
    }
  ];
};
