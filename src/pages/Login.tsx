
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Leaf } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('gmail_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLoginSuccess = (credentialResponse: any) => {
    setIsLoading(true);
    
    // Store the token
    console.log('Login successful, credential received:', credentialResponse);
    
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
      
      // Simulate loading email data
      setTimeout(() => {
        setIsLoading(false);
        navigate('/');
      }, 2000);
    } else {
      console.error('No credential received from Google login');
      setIsLoading(false);
    }
  };

  const handleLoginError = () => {
    console.error('Gmail login failed');
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center leaf-bg">
      <div className="forest-card p-8 max-w-md w-full text-center animate-float">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-forest-moss flex items-center justify-center text-forest-leaf">
            <Leaf className="w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-forest-bark mb-2">Welcome to Forest Mail</h1>
        <p className="text-forest-bark/70 mb-4">Connect with your Gmail to enter the woodland</p>
        
        <div className="mb-4 text-sm text-forest-bark/80">
          <p>For this app to work properly, you'll need to grant permission to:</p>
          <ul className="list-disc text-left mx-auto max-w-xs mt-2">
            <li>Read emails from your Gmail account</li>
            <li>Send emails on your behalf</li>
          </ul>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-t-forest-leaf border-forest-moss/30 rounded-full animate-spin mb-4"></div>
            <p className="text-forest-bark">Gathering leaves and twigs...</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              theme="filled_blue"
              shape="pill"
              size="large"
              text="signin_with"
              useOneTap
              scope="https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send"
            />
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
