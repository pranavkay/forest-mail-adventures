
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Leaf } from 'lucide-react';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('gmail_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLoginSuccess = (credentialResponse: any) => {
    setIsLoading(true);
    
    // In a real implementation, you would:
    // 1. Send the token to your backend
    // 2. Backend would verify the token with Google
    // 3. Backend would fetch initial email data
    // 4. Return user profile and email data
    
    // For prototype purposes, we'll just save the token
    localStorage.setItem('gmail_token', credentialResponse.credential);
    
    // Simulate loading email data
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 2000);
  };

  const handleLoginError = () => {
    console.error('Gmail login failed');
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
        <p className="text-forest-bark/70 mb-8">Connect with your Gmail to enter the woodland</p>
        
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
