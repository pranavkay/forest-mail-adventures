
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { folders } from '@/data/mockData';
import { Archive, Bird, Book, Leaf, Menu, Trash2 } from 'lucide-react';

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
              Tree Branches
            </span>
          )}
        </div>
        
        <nav className="space-y-1 px-2">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolderId(folder.id)}
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
