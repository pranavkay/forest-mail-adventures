
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [token, setToken] = useState<string | null>(localStorage.getItem('gmail_token'));
  const [tokenObject, setTokenObject] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const navigate = useNavigate();

  // Parse token into object on component mount or token change
  useEffect(() => {
    if (token) {
      try {
        // Try to parse the token as a JSON object
        const parsed = JSON.parse(token);
        console.log('Successfully parsed token as JSON object');
        setTokenObject(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        // If it's not a JSON object, it might be a JWT or another format
        console.log('Failed to parse token as JSON, using as raw token');
        setTokenObject(null);
        setIsAuthenticated(true);
      }
    } else {
      setTokenObject(null);
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = (newToken: string) => {
    console.log('Saving new token to localStorage');
    localStorage.setItem('gmail_token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear all localStorage data to ensure a fresh start
    console.log('Clearing all localStorage data for logout');
    localStorage.clear();
    setToken(null);
    setTokenObject(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  // Get the raw access token for API calls
  const getAccessToken = (): string | null => {
    // First check if we have a direct access token
    const directAccessToken = localStorage.getItem('gmail_access_token');
    if (directAccessToken) {
      return directAccessToken;
    }
    
    // Then try to extract from the composite token
    if (tokenObject && tokenObject.access_token) {
      return tokenObject.access_token;
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
