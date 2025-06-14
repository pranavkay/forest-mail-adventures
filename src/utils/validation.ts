
// Input validation and sanitization utilities

export class InputValidator {
  // Email validation
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    if (email.length > 254) {
      return { isValid: false, error: 'Email too long' };
    }
    
    return { isValid: true };
  }
  
  // Subject line validation
  static validateSubject(subject: string): { isValid: boolean; error?: string } {
    if (!subject || typeof subject !== 'string') {
      return { isValid: false, error: 'Subject is required' };
    }
    
    if (subject.trim().length === 0) {
      return { isValid: false, error: 'Subject cannot be empty' };
    }
    
    if (subject.length > 200) {
      return { isValid: false, error: 'Subject too long (max 200 characters)' };
    }
    
    return { isValid: true };
  }
  
  // Email body validation
  static validateEmailBody(body: string): { isValid: boolean; error?: string } {
    if (!body || typeof body !== 'string') {
      return { isValid: false, error: 'Email body is required' };
    }
    
    if (body.trim().length === 0) {
      return { isValid: false, error: 'Email body cannot be empty' };
    }
    
    if (body.length > 50000) {
      return { isValid: false, error: 'Email body too long (max 50,000 characters)' };
    }
    
    return { isValid: true };
  }
  
  // Search query validation
  static validateSearchQuery(query: string): { isValid: boolean; error?: string } {
    if (!query || typeof query !== 'string') {
      return { isValid: true }; // Empty search is allowed
    }
    
    if (query.length > 100) {
      return { isValid: false, error: 'Search query too long (max 100 characters)' };
    }
    
    // Remove potentially dangerous characters
    const sanitized = query.replace(/[<>'"&]/g, '');
    if (sanitized !== query) {
      return { isValid: false, error: 'Search query contains invalid characters' };
    }
    
    return { isValid: true };
  }
  
  // HTML content sanitization (basic)
  static sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }
    
    // Basic HTML escaping
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();
    
    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier)!;
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => time > windowStart);
      
      if (validRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      validRequests.push(now);
      requests.set(identifier, validRequests);
      
      return true; // Request allowed
    };
  }
}

export default InputValidator;
