
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenSecurity from '@/utils/security';

interface UserContextType {
  isAuthenticated: boolean;
  token: string | null;
  tokenObject: any | null;
  login: (token: string) => void;
  logout: () => void;
  hasGmailPermissions: () => boolean;
  getAccessToken: () => string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [tokenObject, setTokenObject] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  // Initialize tokens securely on mount
  useEffect(() => {
    const secureToken = TokenSecurity.getToken('gmail_token');
    if (secureToken && TokenSecurity.validateTokenFormat(secureToken)) {
      setToken(secureToken);
    }
  }, []);

  // Parse token into object on component mount or token change
  useEffect(() => {
    if (token) {
      try {
        // Validate token format first
        if (!TokenSecurity.validateTokenFormat(token)) {
          console.error('Invalid token format detected');
          logout();
          return;
        }
        
        // Log token format for debugging (only in development)
        if (import.meta.env.DEV) {
          console.log('Token format check:', token.substring(0, 20) + '...');
        }
        
        // Try to parse the token as a JSON object
        const parsed = JSON.parse(token);
        if (import.meta.env.DEV) {
          console.log('Successfully parsed token as JSON object');
        }
        setTokenObject(parsed);
        
        // Also store the raw access_token securely
        if (parsed.access_token) {
          TokenSecurity.storeToken('gmail_access_token', parsed.access_token);
        }
        
        setIsAuthenticated(true);
      } catch (e) {
        // If it's not a JSON object, it might be a JWT or another format
        if (import.meta.env.DEV) {
          console.log('Failed to parse token as JSON, using as raw token');
        }
        setTokenObject(null);
        // Store the raw token as access token as well for consistency
        TokenSecurity.storeToken('gmail_access_token', token);
        setIsAuthenticated(true);
      }
    } else {
      setTokenObject(null);
      setIsAuthenticated(false);
      // Clear access token if main token is cleared
      localStorage.removeItem('gmail_access_token');
    }
  }, [token]);

  const login = (newToken: string) => {
    if (!TokenSecurity.validateTokenFormat(newToken)) {
      console.error('Invalid token format provided to login');
      return;
    }
    
    if (import.meta.env.DEV) {
      console.log('Saving new token securely');
    }
    TokenSecurity.storeToken('gmail_token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear all token data securely
    if (import.meta.env.DEV) {
      console.log('Clearing all secure token data for logout');
    }
    TokenSecurity.clearAllTokens();
    setToken(null);
    setTokenObject(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  // Get the raw access token for API calls
  const getAccessToken = (): string | null => {
    // First check if we have a direct access token
    const directAccessToken = TokenSecurity.getToken('gmail_access_token');
    if (directAccessToken && TokenSecurity.validateTokenFormat(directAccessToken)) {
      return directAccessToken;
    }
    
    // Then try to extract from the composite token
    if (tokenObject && tokenObject.access_token) {
      return tokenObject.access_token;
    }
    
    // If we have a raw token but couldn't parse it, try using it directly
    if (token && !tokenObject && TokenSecurity.validateTokenFormat(token)) {
      return token;
    }
    
    if (import.meta.env.DEV) {
      console.log('No valid access token found');
    }
    return null;
  };
  
  // Helper function to check if token has Gmail permissions
  const hasGmailPermissions = () => {
    if (!tokenObject) return false;
    
    // Check for scope property which should contain Gmail permissions
    if (tokenObject.scope) {
      const scopes = tokenObject.scope.split(' ');
      const hasReadScope = scopes.includes('https://www.googleapis.com/auth/gmail.readonly');
      const hasSendScope = scopes.includes('https://www.googleapis.com/auth/gmail.send');
      
      return hasReadScope && hasSendScope;
    }
    
    return false;
  };

  return (
    <UserContext.Provider value={{ 
      isAuthenticated, 
      token, 
      tokenObject,
      login, 
      logout,
      hasGmailPermissions,
      getAccessToken
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
