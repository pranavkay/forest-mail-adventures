
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

// Extend the Email interface to include labels
export interface EmailWithLabels extends BaseEmail {
  labels?: string[];
}

// For backward compatibility
export type Email = EmailWithLabels;
