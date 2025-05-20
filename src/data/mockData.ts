// Import types from our types file instead of creating circular references
import { Contact, Email } from '@/types/email';

// Mock folders data
export const folders = [
  { id: 'inbox', name: 'Inbox', icon: 'leaf', count: 3 },
  { id: 'sent', name: 'Sent Butterflies', icon: 'bird', count: 5 },
  { id: 'drafts', name: 'Drafts', icon: 'book', count: 0 },
  { id: 'archive', name: 'Archive', icon: 'archive', count: 0 },
  { id: 'trash', name: 'Trash', icon: 'trash-2', count: 0 },
];

// Mock contacts data
export const contacts: Contact[] = [
  {
    id: 'c1',
    name: 'Olivia Maple',
    email: 'olivia@forestmail.com',
    woodlandName: 'Wise Owl',
    animal: 'owl',
    avatar: '/avatar-owl.png'
  },
  {
    id: 'c2',
    name: 'Liam Oakley',
    email: 'liam@forestmail.com',
    woodlandName: 'Swift Fox',
    animal: 'fox',
    avatar: '/avatar-fox.png'
  },
  {
    id: 'c3',
    name: 'Emma Pinecone',
    email: 'emma@forestmail.com',
    woodlandName: 'Nimble Rabbit',
    animal: 'rabbit',
    avatar: '/avatar-rabbit.png'
  },
  {
    id: 'c4',
    name: 'Noah Birch',
    email: 'noah@forestmail.com',
    woodlandName: 'Clever Squirrel',
    animal: 'squirrel',
    avatar: '/avatar-squirrel.png'
  }
];

// Animal guides data
export const animalGuides = {
  'new-email': {
    animal: 'fox',
    message: 'To send a new message, click the butterfly in the corner! 🦊'
  },
  'folders': {
    animal: 'owl',
    message: 'Your emails are organized in folders on the left side. Click to explore! 🦉'
  },
  'search': {
    animal: 'rabbit',
    message: 'Looking for something? Use the search bar at the top! 🐰'
  }
};

// Gmail service implementation - keep all the existing code from the original file
// This is a Gmail service implementation using the Google API

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

// Helper function to get the access token (simplified version)
const getAccessToken = (): string | null => {
  // Try to get the direct access token first (most reliable)
  const directAccessToken = localStorage.getItem('gmail_access_token');
  if (directAccessToken) {
    console.log('Using direct access token from localStorage');
    return directAccessToken;
  }
  
  // Fall back to the composite token
  const token = localStorage.getItem('gmail_token');
  if (!token) {
    console.log('No token found in localStorage');
    return null;
  }
  
  try {
    // Try parsing as JSON first (for our composite token)
    const parsedToken = JSON.parse(token);
    if (parsedToken && parsedToken.access_token) {
      console.log('Access token extracted from composite token');
      return parsedToken.access_token;
    }
  } catch (e) {
    // If parsing fails, the token might already be a raw access token
    console.log('Token is not in JSON format, using as raw access token');
    return token;
  }
  
  console.log('Could not extract access token from available tokens');
  return null;
}

// Fetch emails from Gmail API
export const fetchEmails = async (token: string, page: number = 1, pageSize: number = 10): Promise<Email[]> => {
  console.log('fetchEmails called with token type:', typeof token, 'page:', page, 'pageSize:', pageSize);
  
  // Get the access token regardless of what was passed in
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.error('No access token available for Gmail API');
    return [];
  }

  try {
    console.log('Using access token for Gmail API:', accessToken.substring(0, 10) + '...');
    
    // Verify the token is active with a userinfo check
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!userInfoResponse.ok) {
        console.error('User info check failed:', userInfoResponse.status, userInfoResponse.statusText);
        throw new Error(`Token validation failed: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('User info check succeeded:', userInfo.email);
    } catch (error) {
      console.error('Error validating token:', error);
      throw new Error('Authentication failed - please login again');
    }
    
    // Calculate pagination parameters
    const maxResults = pageSize;
    const startIndex = (page - 1) * pageSize;
    
    // Get list of emails from Gmail API - we'll fetch both inbox and sent emails
    const inboxResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&labelIds=INBOX&pageToken=${startIndex > 0 ? `${startIndex}` : ''}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!inboxResponse.ok) {
      // Try to get error details
      let errorMessage = `HTTP Error: ${inboxResponse.status} ${inboxResponse.statusText}`;
      try {
        const errorDetails = await inboxResponse.json();
        console.error('Gmail API error details:', errorDetails);
        if (errorDetails.error && errorDetails.error.message) {
          errorMessage = errorDetails.error.message;
        }
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      
      // Check if we have an auth error
      if (inboxResponse.status === 401) {
        console.error('Authentication error - token may be invalid or expired');
        throw new Error('Authentication failed - please login again');
      } else if (inboxResponse.status === 403) {
        console.error('Permission error - insufficient permissions to access Gmail');
        throw new Error('Permission denied - email scope may not be enabled');
      }
      
      throw new Error(`Failed to fetch emails: ${errorMessage}`);
    }

    const inboxData = await inboxResponse.json();
    console.log('Gmail API inbox response received:', inboxData);
    
    // Also fetch sent emails
    const sentResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&labelIds=SENT&pageToken=${startIndex > 0 ? `${startIndex}` : ''}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const sentData = sentResponse.ok ? await sentResponse.json() : { messages: [] };
    console.log('Gmail API sent response received:', sentData);
    
    // Combine inbox and sent messages, ensuring no duplicates
    const allMessages = [];
    
    if (inboxData.messages && Array.isArray(inboxData.messages)) {
      allMessages.push(...inboxData.messages);
    }
    
    if (sentData.messages && Array.isArray(sentData.messages)) {
      // Add only sent messages that aren't already in the inbox list
      const inboxIds = new Set(allMessages.map(msg => msg.id));
      const uniqueSentMessages = sentData.messages.filter(msg => !inboxIds.has(msg.id));
      allMessages.push(...uniqueSentMessages);
    }
    
    if (allMessages.length === 0) {
      console.log('No messages found in Gmail account');
      return [];
    }

    // Fetch details for each email
    const emailDetailsPromises = allMessages.map(async (message: { id: string }) => {
      const detailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
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
    throw error; // Rethrow to allow the component to handle it
  }
};

export const sendEmail = async (token: string, email: any): Promise<boolean> => {
  // Get the access token regardless of what was passed in
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.error('No access token available for Gmail API');
    throw new Error('Authentication required to send emails');
  }

  try {
    console.log('Using access token for sending email:', accessToken.substring(0, 10) + '...');

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

    console.log('Sending email via Gmail API');
    
    // Send the email via Gmail API
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
    
    // Map Gmail labels to our folder system
    const labels: string[] = [];
    if (email.labelIds) {
      if (email.labelIds.includes('SENT')) {
        labels.push('sent');
      }
      if (email.labelIds.includes('DRAFT')) {
        labels.push('drafts');
      }
      if (email.labelIds.includes('TRASH')) {
        labels.push('trash');
      }
      if (email.labelIds.includes('INBOX')) {
        labels.push('inbox');
      }
      // Add archive label for emails that have no INBOX, TRASH or SPAM label
      if (!email.labelIds.includes('INBOX') && 
          !email.labelIds.includes('TRASH') && 
          !email.labelIds.includes('SPAM') && 
          !email.labelIds.includes('SENT')) {
        labels.push('archive');
      }
    }

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
      read: !email.labelIds.includes('UNREAD'),
      labels: labels
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
      read: false,
      labels: ['inbox']
    }
  ];
};
