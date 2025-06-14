
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { EmailList } from '@/components/EmailList';
import { ComposeEmail } from '@/components/ComposeEmail';
import { AnimalGuide } from '@/components/AnimalGuide';
import { GmailSetupGuide } from '@/components/GmailSetupGuide';
import { useUser } from '@/context/UserContext';
import { toast } from '@/hooks/use-toast';
import { Menu } from 'lucide-react';

// Helper function to get friendly folder names
const getFolderDisplayName = (folderId: string): string => {
  switch (folderId) {
    case 'inbox':
      return 'Mailbox';
    case 'sent':
      return 'Sent Items';
    case 'drafts':
      return 'Drafts';
    case 'archive':
      return 'Archive';
    case 'trash':
      return 'Trash';
    default:
      return folderId.charAt(0).toUpperCase() + folderId.slice(1);
  }
};

const Index = () => {
  const [activeGuide, setActiveGuide] = useState('new-email');
  const { token, hasGmailPermissions } = useUser();
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
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
      // Use the helper function to check for Gmail permissions
      const hasPermissions = hasGmailPermissions();
      
      // Show setup guide if permissions are missing
      setShowSetupGuide(!hasPermissions);
    }
  }, [token, hasGmailPermissions]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar-container');
      const toggleButton = document.querySelector('.sidebar-toggle');

      if (
        showSidebar &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node)
      ) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to page 1 when searching
    handlePageChange(1);
    
    // Show a toast notification
    if (searchQuery) {
      toast({
        title: `Searching for "${searchQuery}"`,
        description: "Looking through your messages",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    // Update URL with new page parameter
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate(`?${params.toString()}`);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50 sidebar-toggle">
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 bg-forest-leaf text-white rounded-full shadow-lg"
        >
          <Menu size={20} />
        </button>
      </div>
      
      {/* Sidebar - hidden on mobile by default, shown when toggled */}
      <div className={`sidebar-container fixed md:relative z-40 transition-transform duration-300 ease-in-out h-screen ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto leaf-bg pt-16 md:pt-0">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <header className="mb-6">
            <div className="forest-card p-4 md:p-6 mb-4">
              <h1 className="text-xl md:text-2xl font-bold text-forest-bark mb-2">
                {getFolderDisplayName(currentFolder)}
              </h1>
              <p className="text-sm md:text-base text-forest-bark/70">Your messages in a peaceful space</p>
            </div>
            
            {showSetupGuide && <GmailSetupGuide />}
            
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search your messages..." 
                className="forest-input w-full pl-10 text-sm md:text-base"
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
