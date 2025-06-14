import CryptoJS from 'crypto-js';

// Enhanced security utilities for token management and validation
class TokenSecurity {
  private static readonly ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'forest-mail-fallback-key-change-in-production';
  private static readonly HMAC_KEY = import.meta.env.VITE_HMAC_KEY || 'forest-mail-hmac-fallback-key';
  private static readonly TOKEN_EXPIRY_HOURS = 24;
  
  // Generate a random IV for each encryption
  private static generateIV(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
  
  // Create HMAC for integrity verification
  private static createHMAC(data: string): string {
    return CryptoJS.HmacSHA256(data, this.HMAC_KEY).toString();
  }
  
  // Verify HMAC integrity
  private static verifyHMAC(data: string, hmac: string): boolean {
    const computedHMAC = this.createHMAC(data);
    return CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(computedHMAC, this.HMAC_KEY)) === 
           CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(hmac, this.HMAC_KEY));
  }
  
  // Enhanced encryption with AES and integrity verification
  static encryptToken(token: string): string {
    try {
      const iv = this.generateIV();
      const timestamp = Date.now();
      
      const tokenData = JSON.stringify({
        data: token,
        timestamp,
        version: '2.0' // Version for future compatibility
      });
      
      // Encrypt with AES
      const encrypted = CryptoJS.AES.encrypt(tokenData, this.ENCRYPTION_KEY, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
      
      // Create payload with IV and encrypted data
      const payload = `${iv}:${encrypted}`;
      
      // Add HMAC for integrity
      const hmac = this.createHMAC(payload);
      
      return `${payload}:${hmac}`;
    } catch (error) {
      console.error('Token encryption failed:', error);
      throw new Error('Failed to encrypt token');
    }
  }
  
  // Enhanced decryption with integrity verification
  static decryptToken(encryptedToken: string): string | null {
    try {
      const parts = encryptedToken.split(':');
      
      // Handle legacy format (backward compatibility)
      if (parts.length === 1) {
        return this.handleLegacyToken(encryptedToken);
      }
      
      if (parts.length !== 3) {
        console.warn('Invalid encrypted token format');
        return null;
      }
      
      const [iv, encrypted, hmac] = parts;
      const payload = `${iv}:${encrypted}`;
      
      // Verify integrity
      if (!this.verifyHMAC(payload, hmac)) {
        console.error('Token integrity verification failed');
        return null;
      }
      
      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.ENCRYPTION_KEY, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      
      // Check expiry
      const tokenAge = Date.now() - decryptedData.timestamp;
      const maxAge = this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
      
      if (tokenAge > maxAge) {
        console.warn('Token has expired');
        return null;
      }
      
      return decryptedData.data;
    } catch (error) {
      console.error('Token decryption failed:', error);
      return null;
    }
  }
  
  // Handle legacy tokens for backward compatibility
  private static handleLegacyToken(token: string): string | null {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(token))));
      
      // Check if legacy token is too old
      const tokenAge = Date.now() - decoded.timestamp;
      const maxAge = this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
      
      if (tokenAge > maxAge) {
        console.warn('Legacy token has expired');
        return null;
      }
      
      return decoded.data;
    } catch {
      // If it's not a legacy token, return null
      return null;
    }
  }
  
  // Enhanced token validation with format and integrity checks
  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Check minimum length
    if (token.length < 10) {
      return false;
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(token))) {
      console.warn('Token contains suspicious patterns');
      return false;
    }
    
    // Try to validate as JSON token
    try {
      const parsed = JSON.parse(token);
      return parsed && (parsed.access_token || parsed.token);
    } catch {
      // Could be a plain access token or encrypted token
      return true;
    }
  }
  
  // Secure token storage with enhanced encryption
  static storeToken(key: string, token: string): void {
    try {
      if (!this.validateTokenFormat(token)) {
        throw new Error('Invalid token format');
      }
      
      const encryptedToken = this.encryptToken(token);
      localStorage.setItem(key, encryptedToken);
      
      // Set expiry timer
      const expiryTime = Date.now() + (this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
      localStorage.setItem(`${key}_expiry`, expiryTime.toString());
    } catch (error) {
      console.error('Failed to store token securely:', error);
      throw error;
    }
  }
  
  // Secure token retrieval with expiry check
  static getToken(key: string): string | null {
    try {
      // Check expiry first
      const expiryTime = localStorage.getItem(`${key}_expiry`);
      if (expiryTime && Date.now() > parseInt(expiryTime)) {
        this.removeToken(key);
        return null;
      }
      
      const encryptedToken = localStorage.getItem(key);
      if (!encryptedToken) return null;
      
      const decryptedToken = this.decryptToken(encryptedToken);
      
      // If decryption fails, remove the corrupted token
      if (!decryptedToken) {
        this.removeToken(key);
        return null;
      }
      
      return decryptedToken;
    } catch (error) {
      console.error('Failed to retrieve token securely:', error);
      this.removeToken(key);
      return null;
    }
  }
  
  // Remove specific token
  static removeToken(key: string): void {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_expiry`);
  }
  
  // Secure cleanup with complete token removal
  static clearAllTokens(): void {
    const tokenKeys = ['gmail_token', 'gmail_access_token'];
    tokenKeys.forEach(key => {
      this.removeToken(key);
    });
    
    // Also clear any other sensitive data
    const sensitiveKeys = Object.keys(localStorage).filter(key => 
      key.includes('token') || key.includes('auth') || key.includes('session')
    );
    
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }
  
  // Security event logging (for monitoring)
  static logSecurityEvent(event: string, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In production, this should be sent to a logging service
    if (import.meta.env.DEV) {
      console.warn('Security Event:', logEntry);
    }
    
    // Store recent security events (limited to prevent storage bloat)
    const recentEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    recentEvents.unshift(logEntry);
    
    // Keep only last 10 events
    localStorage.setItem('security_events', JSON.stringify(recentEvents.slice(0, 10)));
  }
  
  // Check for suspicious activity
  static detectSuspiciousActivity(): boolean {
    const events = JSON.parse(localStorage.getItem('security_events') || '[]');
    const recentEvents = events.filter((event: any) => 
      Date.now() - new Date(event.timestamp).getTime() < 10 * 60 * 1000 // Last 10 minutes
    );
    
    // Flag if too many failed attempts
    const failedAttempts = recentEvents.filter((event: any) => 
      event.event === 'token_decryption_failed' || event.event === 'invalid_token_format'
    );
    
    return failedAttempts.length > 5;
  }
}

export default TokenSecurity;
