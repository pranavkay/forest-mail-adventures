
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { folders } from '@/data/mockData';
import { Archive, Bird, Book, Contact, Leaf, Mail, Menu, Trash2, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { toast } from '@/hooks/use-toast';

const getIconComponent = (iconName: string | undefined) => {
  switch (iconName) {
    case 'leaf':
      return <Leaf className="w-5 h-5" />;
    case 'bird':
      return <Bird className="w-5 h-5" />;
    case 'book':
      return <Book className="w-5 h-5" />;
    case 'archive':
      return <Archive className="w-5 h-5" />;
    case 'trash-2':
      return <Trash2 className="w-5 h-5" />;
    default:
      return <Leaf className="w-5 h-5" />;
  }
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState('inbox');
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();
  
  const mainLinks = [
    { id: 'home', name: 'Forest Home', icon: <Mail className="w-5 h-5" />, path: '/' },
    { id: 'contacts', name: 'Woodland Friends', icon: <Contact className="w-5 h-5" />, path: '/contacts' },
  ];

  const handleFolderSelect = (folderId: string) => {
    setActiveFolderId(folderId);
    
    // Navigate to the main page with the folder as a query param
    navigate(`/?folder=${folderId}`);
    
    // Show a toast notification
    toast({
      title: `${folders.find(f => f.id === folderId)?.name} selected`,
      description: "Viewing emails in this folder",
    });
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logout successful",
      description: "You have left the forest",
    });
  };
  
  // Get current folder from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const folderParam = params.get('folder');
    if (folderParam) {
      setActiveFolderId(folderParam);
    }
  }, [location.search]);

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-in-out bg-sidebar h-screen',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="text-forest-cream font-bold text-xl">Forest Mail</div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-sidebar-accent text-sidebar-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mt-8">
        <div className={cn(
          "px-4 mb-2", 
          collapsed ? "text-center" : "text-left"
        )}>
          {!collapsed && (
            <span className="text-sidebar-foreground text-sm font-semibold">
              Main Paths
            </span>
          )}
        </div>

        <nav className="space-y-1 px-2">
          {mainLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={cn(
                'w-full flex items-center p-2 rounded-xl transition-colors',
                location.pathname === link.path
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed ? 'justify-center' : 'justify-start'
              )}
            >
              <div className="flex items-center justify-center">
                {link.icon}
              </div>
              
              {!collapsed && (
                <span className="ml-3 text-sm">{link.name}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className={cn(
          "px-4 mb-2 mt-6", 
          collapsed ? "text-center" : "text-left"
        )}>
          {!collapsed && (
            <span className="text-sidebar-foreground text-sm font-semibold">
              Tree Branches
            </span>
          )}
        </div>
        
        <nav className="space-y-1 px-2">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => handleFolderSelect(folder.id)}
              className={cn(
                'w-full flex items-center p-2 rounded-xl transition-colors',
                activeFolderId === folder.id
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed ? 'justify-center' : 'justify-start'
              )}
            >
              <div className="flex items-center justify-center">
                {getIconComponent(folder.icon)}
              </div>
              
              {!collapsed && (
                <>
                  <span className="ml-3 text-sm">{folder.name}</span>
                  {folder.count > 0 && (
                    <span className="ml-auto bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {folder.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      <div className={cn(
        "absolute bottom-16 left-0 right-0 px-4 py-2",
        collapsed ? "flex justify-center" : ""
      )}>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center p-2 rounded-xl transition-colors text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <div className="flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          
          {!collapsed && (
            <span className="ml-3 text-sm">Leave Forest</span>
          )}
        </button>
      </div>
      
      <div className={cn(
        "absolute bottom-4 left-0 right-0 px-4 py-2",
        collapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "text-xs text-forest-cream/70 italic",
          collapsed ? "hidden" : "block"
        )}>
          A treehouse for your messages
        </div>
      </div>
    </div>
  );
};
