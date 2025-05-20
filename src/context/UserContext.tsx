import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserContextType {
  isAuthenticated: boolean;
  token: string | null;
  tokenObject: any | null;
  login: (token: string) => void;
  logout: () => void;
  hasGmailPermissions: () => boolean;
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
        setTokenObject(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        // If it's not a JSON object, it might be a JWT or another format
        // Keep it as is but still set authenticated to true
        setTokenObject(null);
        setIsAuthenticated(true);
      }
    } else {
      setTokenObject(null);
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('gmail_token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear all localStorage data to ensure a fresh start
    localStorage.clear();
    setToken(null);
    setTokenObject(null);
    setIsAuthenticated(false);
    navigate('/login');
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
      hasGmailPermissions
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
