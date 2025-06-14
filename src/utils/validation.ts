
import XSSProtection from './xss-protection';

// Enhanced input validation and sanitization utilities
export class InputValidator {
  // Rate limiter instances
  private static rateLimiters = new Map<string, (identifier: string) => boolean>();
  
  // Enhanced email validation with XSS protection
  static validateEmail(email: string): { isValid: boolean; error?: string; sanitized: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required', sanitized: '' };
    }
    
    // Sanitize the email first
    const sanitized = XSSProtection.sanitizeEmail(email);
    
    if (!sanitized) {
      return { isValid: false, error: 'Invalid email format', sanitized: '' };
    }
    
    // Additional length check
    if (sanitized.length > 254) {
      return { isValid: false, error: 'Email too long', sanitized };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\+{5,}/, // Multiple plus signs
      /\.{5,}/, // Multiple dots
      /@.*@/, // Multiple @ symbols
      /[<>'"&]/ // HTML/script injection attempts
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(email))) {
      return { isValid: false, error: 'Email contains invalid characters', sanitized };
    }
    
    return { isValid: true, sanitized };
  }
  
  // Enhanced subject validation with XSS protection
  static validateSubject(subject: string): { isValid: boolean; error?: string; sanitized: string } {
    if (!subject || typeof subject !== 'string') {
      return { isValid: false, error: 'Subject is required', sanitized: '' };
    }
    
    // Sanitize the subject
    const sanitized = XSSProtection.sanitizeText(subject);
    
    if (sanitized.trim().length === 0) {
      return { isValid: false, error: 'Subject cannot be empty', sanitized };
    }
    
    if (sanitized.length > 200) {
      return { isValid: false, error: 'Subject too long (max 200 characters)', sanitized };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:.*base64/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(subject))) {
      return { isValid: false, error: 'Subject contains potentially dangerous content', sanitized };
    }
    
    return { isValid: true, sanitized };
  }
  
  // Enhanced email body validation with XSS protection
  static validateEmailBody(body: string): { isValid: boolean; error?: string; sanitized: string } {
    if (!body || typeof body !== 'string') {
      return { isValid: false, error: 'Email body is required', sanitized: '' };
    }
    
    // Sanitize HTML content
    const sanitized = XSSProtection.sanitizeHTML(body);
    
    if (sanitized.trim().length === 0) {
      return { isValid: false, error: 'Email body cannot be empty', sanitized };
    }
    
    if (sanitized.length > 50000) {
      return { isValid: false, error: 'Email body too long (max 50,000 characters)', sanitized };
    }
    
    // Check for excessive nested elements (potential DoS)
    const nestingLevel = (sanitized.match(/<[^>]*>/g) || []).length;
    if (nestingLevel > 1000) {
      return { isValid: false, error: 'Email body structure too complex', sanitized };
    }
    
    return { isValid: true, sanitized };
  }
  
  // Enhanced search query validation
  static validateSearchQuery(query: string): { isValid: boolean; error?: string; sanitized: string } {
    if (!query || typeof query !== 'string') {
      return { isValid: true, sanitized: '' }; // Empty search is allowed
    }
    
    // Sanitize the query
    const sanitized = XSSProtection.sanitizeText(query);
    
    if (sanitized.length > 100) {
      return { isValid: false, error: 'Search query too long (max 100 characters)', sanitized };
    }
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
      /(\bOR\b|\bAND\b)\s*\d+\s*=\s*\d+/i,
      /['"];?\s*--/,
      /\/\*[\s\S]*?\*\//
    ];
    
    if (sqlPatterns.some(pattern => pattern.test(query))) {
      return { isValid: false, error: 'Search query contains invalid patterns', sanitized };
    }
    
    return { isValid: true, sanitized };
  }
  
  // Enhanced rate limiting with IP tracking
  static createRateLimiter(maxRequests: number, windowMs: number, identifier: string = 'default') {
    const limiterKey = `${identifier}_${maxRequests}_${windowMs}`;
    
    if (!this.rateLimiters.has(limiterKey)) {
      const requests = new Map<string, number[]>();
      
      const limiter = (userIdentifier: string): boolean => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!requests.has(userIdentifier)) {
          requests.set(userIdentifier, []);
        }
        
        const userRequests = requests.get(userIdentifier)!;
        
        // Remove old requests outside the window
        const validRequests = userRequests.filter(time => time > windowStart);
        
        if (validRequests.length >= maxRequests) {
          // Log potential abuse
          console.warn(`Rate limit exceeded for ${userIdentifier}`, {
            requests: validRequests.length,
            limit: maxRequests,
            window: windowMs
          });
          return false;
        }
        
        validRequests.push(now);
        requests.set(userIdentifier, validRequests);
        
        // Clean up old entries periodically
        if (Math.random() < 0.1) { // 10% chance
          const cutoff = now - (windowMs * 2);
          for (const [key, times] of requests.entries()) {
            const recentTimes = times.filter(time => time > cutoff);
            if (recentTimes.length === 0) {
              requests.delete(key);
            } else {
              requests.set(key, recentTimes);
            }
          }
        }
        
        return true;
      };
      
      this.rateLimiters.set(limiterKey, limiter);
    }
    
    return this.rateLimiters.get(limiterKey)!;
  }
  
  // Validate file uploads
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File too large (max 10MB)' };
    }
    
    // Check allowed file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }
    
    // Check file name for suspicious patterns
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|jsp)$/i,
      /[<>:"|?*]/,
      /^\./,
      /\s+$/
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      return { isValid: false, error: 'Invalid file name' };
    }
    
    return { isValid: true };
  }
  
  // Validate URL parameters
  static validateURLParams(params: URLSearchParams): boolean {
    for (const [key, value] of params.entries()) {
      // Check for XSS attempts in URL parameters
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /data:.*base64/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(key) || pattern.test(value))) {
        console.warn('Suspicious URL parameter detected', { key, value });
        return false;
      }
    }
    
    return true;
  }
  
  // Create a secure random string
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

export default InputValidator;
