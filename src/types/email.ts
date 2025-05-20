
import { Email as BaseEmail, Contact } from '@/data/mockData';

// Extend the Email interface to include labels
export interface EmailWithLabels extends BaseEmail {
  labels?: string[];
}

// For backward compatibility
export type Email = EmailWithLabels;

// Export the Contact type for use in other files
export type { Contact };
