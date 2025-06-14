
import DOMPurify from 'dompurify';

// XSS Protection utilities
export class XSSProtection {
  // Sanitize HTML content
  static sanitizeHTML(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }
    
    // Configure DOMPurify for email content
    const config = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'span', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'style'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'meta'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
      SANITIZE_DOM: true,
      SANITIZE_NAMED_PROPS: true,
      SANITIZE_NAMED_PROPS_PREFIX: 'user-content-',
      WHOLE_DOCUMENT: false,
      FORCE_BODY: false
    };
    
    return DOMPurify.sanitize(html, config);
  }
  
  // Sanitize plain text (escape HTML entities)
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  // Sanitize email addresses
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }
    
    // Remove any HTML tags and dangerous characters
    const cleaned = email
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>"'&]/g, '') // Remove dangerous characters
      .trim()
      .toLowerCase();
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(cleaned) ? cleaned : '';
  }
  
  // Sanitize URLs
  static sanitizeURL(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }
    
    try {
      const urlObj = new URL(url);
      
      // Only allow http, https, and mailto protocols
      if (!['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
        return '';
      }
      
      return urlObj.toString();
    } catch {
      return '';
    }
  }
  
  // Create safe innerHTML replacement
  static createSafeHTML(html: string): { __html: string } {
    return { __html: this.sanitizeHTML(html) };
  }
  
  // Validate CSP nonce
  static validateNonce(nonce: string): boolean {
    if (!nonce || typeof nonce !== 'string') {
      return false;
    }
    
    // Check nonce format (base64 with minimum length)
    const nonceRegex = /^[A-Za-z0-9+/=]{16,}$/;
    return nonceRegex.test(nonce);
  }
  
  // Generate CSP nonce
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }
}

export default XSSProtection;
