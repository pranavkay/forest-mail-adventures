
// This is a Gmail service implementation using the Google API
import { Email, Contact } from '@/types/email';
import TokenSecurity from '@/utils/security';
import InputValidator from '@/utils/validation';
import XSSProtection from '@/utils/xss-protection';

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

// Helper function to get the access token securely
const getAccessToken = (): string | null => {
  // Try to get the direct access token first (most reliable)
  const directAccessToken = TokenSecurity.getToken('gmail_access_token');
  if (directAccessToken && TokenSecurity.validateTokenFormat(directAccessToken)) {
    return directAccessToken;
  }
  
  // Fall back to the composite token
  const token = TokenSecurity.getToken('gmail_token');
  if (!token) {
    return null;
  }
  
  try {
    // Try parsing as JSON first (for our composite token)
    const parsedToken = JSON.parse(token);
    if (parsedToken && parsedToken.access_token) {
      return parsedToken.access_token;
    }
  } catch (e) {
    // If parsing fails, the token might already be a raw access token
    if (TokenSecurity.validateTokenFormat(token)) {
      return token;
    }
  }
  
  return null;
}

// Rate limiter for API calls
const apiRateLimiter = InputValidator.createRateLimiter(100, 60000); // 100 requests per minute

// Fetch emails from Gmail API with pagination support
export const fetchEmails = async (token: string, startIndex = 0, maxResults = 10): Promise<Email[]> => {
  // Check rate limit
  if (!apiRateLimiter('gmail-fetch')) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }

  // Get the access token securely
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    throw new Error('Authentication required - please login again');
  }

  try {
    // Verify the token is active with a userinfo check
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!userInfoResponse.ok) {
        throw new Error('Authentication failed - please login again');
      }
      
      const userInfo = await userInfoResponse.json();
      if (import.meta.env.DEV) {
        console.log('User info check succeeded:', userInfo.email);
      }
    } catch (error) {
      throw new Error('Authentication failed - please login again');
    }
    
    // Get list of emails from Gmail API with pagination parameters
    const inboxResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&startIndex=${startIndex}&labelIds=INBOX`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!inboxResponse.ok) {
      // Handle specific error cases without exposing sensitive information
      if (inboxResponse.status === 401) {
        throw new Error('Authentication failed - please login again');
      } else if (inboxResponse.status === 403) {
        throw new Error('Permission denied - email scope may not be enabled');
      } else if (inboxResponse.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      throw new Error('Failed to fetch emails - please try again');
    }

    const inboxData = await inboxResponse.json();
    
    // Also fetch sent emails with the same pagination
    const sentResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&startIndex=${startIndex}&labelIds=SENT`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const sentData = sentResponse.ok ? await sentResponse.json() : { messages: [] };
    
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
      return [];
    }

    // Fetch details for each email with error handling
    const emailDetailsPromises = allMessages.map(async (message: { id: string }) => {
      try {
        const detailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (!detailResponse.ok) {
          return null;
        }
        
        return await detailResponse.json();
      } catch (error) {
        return null;
      }
    });

    const emailDetails = await Promise.all(emailDetailsPromises);
    const validEmails = emailDetails.filter(email => email !== null) as GmailEmail[];
    
    return transformGmailData(validEmails);
  } catch (error) {
    // Re-throw known errors, wrap unknown errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching emails');
  }
};

export const sendEmail = async (token: string, email: any): Promise<boolean> => {
  // Validate input
  const emailValidation = InputValidator.validateEmail(email.to);
  if (!emailValidation.isValid) {
    throw new Error(emailValidation.error || 'Invalid recipient email');
  }
  
  const subjectValidation = InputValidator.validateSubject(email.subject);
  if (!subjectValidation.isValid) {
    throw new Error(subjectValidation.error || 'Invalid subject');
  }
  
  const bodyValidation = InputValidator.validateEmailBody(email.body);
  if (!bodyValidation.isValid) {
    throw new Error(bodyValidation.error || 'Invalid email body');
  }

  // Check rate limit
  if (!apiRateLimiter('gmail-send')) {
    throw new Error('Rate limit exceeded. Please wait before sending more emails.');
  }

  // Get the access token securely
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    throw new Error('Authentication required to send emails');
  }

  try {
    // Sanitize email content
    const sanitizedSubject = XSSProtection.sanitizeHTML(email.subject);
    const sanitizedBody = XSSProtection.sanitizeHTML(email.body);

    // Create the email in RFC 2822 format
    const emailContent = [
      `From: ${email.from}`,
      `To: ${email.to}`,
      `Subject: ${sanitizedSubject}`,
      '',
      sanitizedBody
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
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      } else if (response.status === 403) {
        throw new Error('Permission denied - cannot send emails');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      
      throw new Error('Failed to send email - please try again');
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while sending email');
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
