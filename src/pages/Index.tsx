
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { EmailList } from '@/components/EmailList';
import { ComposeEmail } from '@/components/ComposeEmail';
import { AnimalGuide } from '@/components/AnimalGuide';
import { GmailSetupGuide } from '@/components/GmailSetupGuide';
import { useUser } from '@/context/UserContext';

const Index = () => {
  const [activeGuide, setActiveGuide] = useState('new-email');
  const { token } = useUser();
  const [showSetupGuide, setShowSetupGuide] = useState(true); // Always show the guide until properly configured
  
  useEffect(() => {
    const guideOrder = ['new-email', 'folders', 'search'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % guideOrder.length;
      setActiveGuide(guideOrder[currentIndex]);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check if token exists but doesn't have Gmail scope
  useEffect(() => {
    if (token) {
      try {
        // Simple check to determine if we're dealing with a Google OAuth token
        const isGoogleToken = token.includes('ya29.') || (token.includes('.') && JSON.parse(atob(token.split('.')[1])).iss === 'https://accounts.google.com');
        
        if (isGoogleToken) {
          // Always show setup guide until properly configured
          setShowSetupGuide(true);
        }
      } catch (e) {
        console.error('Error checking token:', e);
      }
    }
  }, [token]);
  
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-6 leaf-bg">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <div className="forest-card p-6 mb-4">
              <h1 className="text-2xl font-bold text-forest-bark mb-2">Welcome to your Forest Mail</h1>
              <p className="text-forest-bark/70">Where your messages flutter and leaves gently fall</p>
            </div>
            
            {showSetupGuide && <GmailSetupGuide />}
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search through the forest..." 
                className="forest-input w-full pl-10"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
            </div>
          </header>
          
          <main>
            <EmailList />
          </main>
        </div>
      </div>
      
      <ComposeEmail />
      <AnimalGuide guideId={activeGuide} />
    </div>
  );
};

export default Index;
