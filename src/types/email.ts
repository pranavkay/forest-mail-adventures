
import { Email as BaseEmail } from '@/data/mockData';

// Extend the Email interface to include labels
export interface EmailWithLabels extends BaseEmail {
  labels?: string[];
}

// For backward compatibility
export type Email = EmailWithLabels;
