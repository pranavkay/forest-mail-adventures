
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { EmailList } from '@/components/EmailList';
import { ComposeEmail } from '@/components/ComposeEmail';
import { AnimalGuide } from '@/components/AnimalGuide';
import { GmailSetupGuide } from '@/components/GmailSetupGuide';
import { useUser } from '@/context/UserContext';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [activeGuide, setActiveGuide] = useState('new-email');
  const { token, hasGmailPermissions } = useUser();
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentFolder = searchParams.get('folder') || 'inbox';
  const pageParam = searchParams.get('page');
  const [page, setPage] = useState(pageParam ? parseInt(pageParam, 10) : 1);
  const [pageSize] = useState(10);
  
  useEffect(() => {
    // Update page from URL when it changes
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl) {
      setPage(parseInt(pageFromUrl, 10));
    } else {
      setPage(1); // Reset to page 1 when not specified
    }
  }, [location.search]);
  
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
    // Reset to page 1 when searching
    handlePageChange(1);
    
    // Show a toast notification
    if (searchQuery) {
      toast({
        title: `Searching for "${searchQuery}"`,
        description: "Looking through the forest for your messages",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    // Update URL with new page parameter
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate(`?${params.toString()}`);
    
    // We don't need to call setPage here as the useEffect will handle that
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
