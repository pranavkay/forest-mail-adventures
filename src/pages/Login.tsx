
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Leaf } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { toast } from '@/hooks/use-toast';
import TokenSecurity from '@/utils/security';
import { SecurityMonitor } from '@/components/SecurityMonitor';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  // Clear any previous login data on component mount
  useEffect(() => {
    TokenSecurity.clearAllTokens(); // Use secure cleanup
    TokenSecurity.logSecurityEvent('login_page_accessed');
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = TokenSecurity.getToken('gmail_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
    
    try {
      if (import.meta.env.DEV) {
        console.log('Google login successful');
      }
      
      if (tokenResponse.access_token) {
        // Store the raw access token securely
        TokenSecurity.storeToken('gmail_access_token', tokenResponse.access_token);
        
        // Get user info to create a more complete token object
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        });
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          
          if (import.meta.env.DEV) {
            console.log('User info retrieved successfully');
          }
          
          // Create a composite token object with access_token and userInfo
          const compositeToken = JSON.stringify({
            access_token: tokenResponse.access_token,
            scope: tokenResponse.scope,
            user_info: userInfo
          });
          
          // Login with the composite token (will be stored securely)
          login(compositeToken);
          
          TokenSecurity.logSecurityEvent('successful_google_login', { 
            email: userInfo.email 
          });
          
          toast({
            title: "Login successful!",
            description: "Welcome to Forest Mail",
          });
          
          // Navigate to home
          setTimeout(() => {
            setIsLoading(false);
            navigate('/');
          }, 1000);
        } else {
          throw new Error('Failed to fetch user info');
        }
      } else {
        throw new Error('No access token received from Google login');
      }
    } catch (error) {
      console.error('Error during login process:', error);
      
      TokenSecurity.logSecurityEvent('login_error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      // Try to proceed with just the access token as fallback
      if (tokenResponse.access_token) {
        try {
          const simpleToken = JSON.stringify({
            access_token: tokenResponse.access_token,
            scope: tokenResponse.scope
          });
          
          login(simpleToken);
          setIsLoading(false);
          
          toast({
            title: "Login partially successful",
            description: "Got your access token but couldn't retrieve your profile",
            variant: "default"
          });
          
          navigate('/');
        } catch (fallbackError) {
          setIsLoading(false);
          toast({
            title: "Login failed",
            description: "Unable to complete login process",
            variant: "destructive"
          });
        }
      } else {
        setIsLoading(false);
        toast({
          title: "Login failed",
          description: "Unable to get login credentials",
          variant: "destructive"
        });
      }
    }
  };

  const handleGoogleError = (error) => {
    console.error('Gmail login failed:', error);
    setIsLoading(false);
    
    TokenSecurity.logSecurityEvent('google_login_error', { 
      error: error?.error || 'Unknown error' 
    });
    
    toast({
      title: "Login failed",
      description: "Please try again or check your Google account",
      variant: "destructive"
    });
  };
  
  // Use the useGoogleLogin hook with proper configuration for implicit flow
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
    flow: 'implicit'
  });

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center leaf-bg p-4">
      <div className="w-full max-w-md">
        <SecurityMonitor />
        
        <div className="forest-card p-6 md:p-8 w-full text-center animate-float">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-forest-moss flex items-center justify-center text-forest-leaf">
              <Leaf className="w-7 h-7 md:w-8 md:h-8" />
            </div>
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold text-forest-bark mb-2">Welcome to Forest Mail</h1>
          <p className="text-sm md:text-base text-forest-bark/70 mb-6">Connect with your Gmail to enter the woodland</p>
          
          <div className="mb-6 text-xs md:text-sm text-forest-bark/80 p-3 md:p-4 bg-forest-moss/10 rounded-lg">
            <p className="font-medium mb-2">🔒 Forest Mail needs permission to:</p>
            <ul className="list-disc text-left mx-auto max-w-xs space-y-1 md:space-y-2 pl-4">
              <li>Read emails from your Gmail account</li>
              <li>Send emails on your behalf</li>
            </ul>
            <p className="mt-2 md:mt-3 text-xs">We only use these permissions to display and send emails through the Forest Mail interface.</p>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-t-forest-leaf border-forest-moss/30 rounded-full animate-spin mb-4"></div>
              <p className="text-sm md:text-base text-forest-bark">Gathering leaves and twigs...</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => googleLogin()}
                className="flex items-center gap-2 bg-white text-gray-700 font-medium px-5 py-2 md:px-6 md:py-3 rounded-full shadow hover:shadow-md transition-all text-sm md:text-base"
              >
                <img src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg" alt="Google" className="w-4 h-4 md:w-5 md:h-5" />
                Sign in with Google
              </button>
            </div>
          )}
          
          <p className="mt-6 md:mt-8 text-xs text-forest-bark/50">
            Your magical forest adventure awaits behind your Gmail login
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
