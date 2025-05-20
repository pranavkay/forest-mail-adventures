
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { EmailList } from '@/components/EmailList';
import { ComposeEmail } from '@/components/ComposeEmail';
import { AnimalGuide } from '@/components/AnimalGuide';
import { GmailSetupGuide } from '@/components/GmailSetupGuide';
import { useUser } from '@/context/UserContext';

const Index = () => {
  const [activeGuide, setActiveGuide] = useState('new-email');
  const { token, hasGmailPermissions } = useUser();
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const currentFolder = new URLSearchParams(location.search).get('folder') || 'inbox';
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  useEffect(() => {
    const guideOrder = ['new-email', 'folders', 'search'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % guideOrder.length;
      setActiveGuide(guideOrder[currentIndex]);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check if token exists and validate if it has Gmail scopes
  useEffect(() => {
    if (token) {
      // Use the new helper function to check for Gmail permissions
      const hasPermissions = hasGmailPermissions();
      console.log('Gmail permissions check:', hasPermissions);
      
      // Show setup guide if permissions are missing
      setShowSetupGuide(!hasPermissions);
    }
  }, [token, hasGmailPermissions]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // We'll implement actual search functionality later
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-6 leaf-bg">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <div className="forest-card p-6 mb-4">
              <h1 className="text-2xl font-bold text-forest-bark mb-2">
                {currentFolder === 'inbox' ? 'Welcome to your Forest Mail' : 
                 currentFolder === 'sent' ? 'Sent Butterflies' :
                 `Browsing ${currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)} Messages`}
              </h1>
              <p className="text-forest-bark/70">Where your messages flutter and leaves gently fall</p>
            </div>
            
            {showSetupGuide && <GmailSetupGuide />}
            
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search through the forest..." 
                className="forest-input w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
            </form>
          </header>
          
          <main>
            <EmailList 
              folderId={currentFolder} 
              searchQuery={searchQuery} 
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>
      
      <ComposeEmail />
      <AnimalGuide guideId={activeGuide} />
    </div>
  );
};

export default Index;
