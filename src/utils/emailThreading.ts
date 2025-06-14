
import { EmailWithLabels, EmailThread, Contact } from '@/types/email';

// Function to normalize subject for threading (removes Re:, Fwd:, etc.)
const normalizeSubject = (subject: string): string => {
  return subject
    .replace(/^(re:|fwd?:|fw:)\s*/gi, '')
    .trim()
    .toLowerCase();
};

// Function to group emails into threads
export const groupEmailsIntoThreads = (emails: EmailWithLabels[]): EmailThread[] => {
  const threadMap = new Map<string, EmailWithLabels[]>();
  
  // Group emails by normalized subject
  emails.forEach(email => {
    const normalizedSubject = normalizeSubject(email.subject);
    
    if (!threadMap.has(normalizedSubject)) {
      threadMap.set(normalizedSubject, []);
    }
    
    threadMap.get(normalizedSubject)!.push(email);
  });
  
  // Convert groups to threads
  const threads: EmailThread[] = [];
  
  threadMap.forEach((threadEmails, normalizedSubject) => {
    // Sort emails by date (newest first)
    threadEmails.sort((a, b) => new Date(b.received).getTime() - new Date(a.received).getTime());
    
    const latestEmail = threadEmails[0];
    const hasUnread = threadEmails.some(email => !email.read);
    
    // Get unique participants
    const participantMap = new Map<string, Contact>();
    threadEmails.forEach(email => {
      participantMap.set(email.from.email, email.from);
    });
    const participants = Array.from(participantMap.values());
    
    const thread: EmailThread = {
      id: `thread-${normalizedSubject}`,
      subject: latestEmail.subject, // Use the latest email's subject (with Re:, Fwd:, etc.)
      emails: threadEmails,
      latestEmail,
      messageCount: threadEmails.length,
      hasUnread,
      participants
    };
    
    threads.push(thread);
  });
  
  // Sort threads by latest email date
  threads.sort((a, b) => new Date(b.latestEmail.received).getTime() - new Date(a.latestEmail.received).getTime());
  
  return threads;
};

// Function to check if a thread has multiple messages
export const isThread = (thread: EmailThread): boolean => {
  return thread.messageCount > 1;
};
