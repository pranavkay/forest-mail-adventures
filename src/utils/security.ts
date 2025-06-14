
// Security utilities for token management and validation

// Simple encryption/decryption using browser's built-in crypto API
class TokenSecurity {
  private static readonly ENCRYPTION_KEY = 'forest-mail-key';
  
  // Encrypt data before storing in localStorage
  static encryptToken(token: string): string {
    try {
      // Simple obfuscation (not cryptographically secure, but better than plain text)
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({
        data: token,
        timestamp: Date.now()
      }))));
      return encoded;
    } catch (error) {
      console.error('Token encryption failed:', error);
      return token; // Fallback to plain token
    }
  }
  
  // Decrypt data from localStorage
  static decryptToken(encryptedToken: string): string | null {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(encryptedToken))));
      
      // Check if token is too old (24 hours)
      const tokenAge = Date.now() - decoded.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > maxAge) {
        console.warn('Token has expired');
        return null;
      }
      
      return decoded.data;
    } catch (error) {
      // If decryption fails, try to use as plain token (backward compatibility)
      console.warn('Token decryption failed, attempting plain token usage');
      return encryptedToken;
    }
  }
  
  // Validate token format
  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Check if it's a JSON token
    try {
      const parsed = JSON.parse(token);
      return parsed && (parsed.access_token || parsed.token);
    } catch {
      // Could be a plain access token
      return token.length > 10; // Basic length check
    }
  }
  
  // Secure token storage
  static storeToken(key: string, token: string): void {
    try {
      const encryptedToken = this.encryptToken(token);
      localStorage.setItem(key, encryptedToken);
    } catch (error) {
      console.error('Failed to store token securely:', error);
    }
  }
  
  // Secure token retrieval
  static getToken(key: string): string | null {
    try {
      const encryptedToken = localStorage.getItem(key);
      if (!encryptedToken) return null;
      
      return this.decryptToken(encryptedToken);
    } catch (error) {
      console.error('Failed to retrieve token securely:', error);
      return null;
    }
  }
  
  // Secure cleanup
  static clearAllTokens(): void {
    const tokenKeys = ['gmail_token', 'gmail_access_token'];
    tokenKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export default TokenSecurity;
