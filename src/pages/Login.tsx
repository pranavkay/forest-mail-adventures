
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Leaf } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();
  
  // Get current URL for redirect
  const currentUrl = window.location.origin;

  // Clear any previous login data on component mount
  useEffect(() => {
    localStorage.clear(); // Clear all data to ensure a fresh start
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('gmail_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
    
    console.log('Google login successful:', tokenResponse);
    
    if (tokenResponse.access_token) {
      // Save the token and credentials
      localStorage.setItem('gmail_access_token', tokenResponse.access_token);
      
      // Get user info to create a more complete token object
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        });
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          
          // Create a composite token object with access_token and scopes
          const compositeToken = JSON.stringify({
            access_token: tokenResponse.access_token,
            scope: tokenResponse.scope,
            user_info: userInfo
          });
          
          login(compositeToken);
          
          toast({
            title: "Login successful!",
            description: "Welcome to Forest Mail",
          });
          
          // Simulate loading email data
          setTimeout(() => {
            setIsLoading(false);
            navigate('/');
          }, 1000);
        } else {
          throw new Error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setIsLoading(false);
        
        toast({
          title: "Login failed",
          description: "Unable to get user information",
          variant: "destructive"
        });
      }
    } else {
      console.error('No access token received from Google login');
      setIsLoading(false);
      
      toast({
        title: "Login failed",
        description: "Unable to get login credentials",
        variant: "destructive"
      });
    }
  };

  const handleGoogleError = (error) => {
    console.error('Gmail login failed:', error);
    setIsLoading(false);
    
    toast({
      title: "Login failed",
      description: "Please try again or check your Google account",
      variant: "destructive"
    });
  };
  
  // Update to use explicit redirect_uri approach
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
    flow: 'implicit',
    ux_mode: 'popup', // Changed from implicit flow to popup mode
  });

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center leaf-bg">
      <div className="forest-card p-8 max-w-md w-full text-center animate-float">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-forest-moss flex items-center justify-center text-forest-leaf">
            <Leaf className="w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-forest-bark mb-2">Welcome to Forest Mail</h1>
        <p className="text-forest-bark/70 mb-6">Connect with your Gmail to enter the woodland</p>
        
        <div className="mb-6 text-sm text-forest-bark/80 p-4 bg-forest-moss/10 rounded-lg">
          <p className="font-medium mb-2">🔒 Forest Mail needs permission to:</p>
          <ul className="list-disc text-left mx-auto max-w-xs space-y-2">
            <li>Read emails from your Gmail account</li>
            <li>Send emails on your behalf</li>
          </ul>
          <p className="mt-3 text-xs">We only use these permissions to display and send emails through the Forest Mail interface.</p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-t-forest-leaf border-forest-moss/30 rounded-full animate-spin mb-4"></div>
            <p className="text-forest-bark">Gathering leaves and twigs...</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => googleLogin()}
              className="flex items-center gap-2 bg-white text-gray-700 font-medium px-6 py-3 rounded-full shadow hover:shadow-md transition-all"
            >
              <img src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        )}
        
        <p className="mt-8 text-xs text-forest-bark/50">
          Your magical forest adventure awaits behind your Gmail login
        </p>
      </div>
    </div>
  );
};

export default Login;
