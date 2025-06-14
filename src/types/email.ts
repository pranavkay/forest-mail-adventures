
// Define our base types for the application
export interface Contact {
  id: string;
  name: string;
  email: string;
  woodlandName?: string;
  animal?: 'fox' | 'rabbit' | 'owl' | 'squirrel' | 'cat' | 'dog' | 'bird';
  avatar?: string;
}

export interface BaseEmail {
  id: string;
  from: Contact;
  subject: string;
  body: string;
  received: string;
  read: boolean;
}

// Extend the Email interface to include labels and threading
export interface EmailWithLabels extends BaseEmail {
  labels?: string[];
  threadId?: string;
}

// Thread interface to group emails
export interface EmailThread {
  id: string;
  subject: string;
  emails: EmailWithLabels[];
  latestEmail: EmailWithLabels;
  messageCount: number;
  hasUnread: boolean;
  participants: Contact[];
}

// For backward compatibility
export type Email = EmailWithLabels;
