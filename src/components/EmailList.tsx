import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { fetchEmails } from '@/data/mockData';
import { Email } from '@/types/email';
import { useUser } from '@/context/UserContext';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface EmailListProps {
  folderId: string;
  searchQuery?: string;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  folderId,
  searchQuery = '',
  page,
  pageSize,
  onPageChange,
}) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [totalEmails, setTotalEmails] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refresh
  const { token } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to load emails
  const loadEmails = async () => {
    if (!token) {
      setEmails([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching emails for folder: ${folderId}, page: ${page}, pageSize: ${pageSize}`);
      const allEmails = await fetchEmails(token, page, pageSize);
      console.log('Fetched emails:', allEmails);

      // Filter emails based on folder and search query
      const filteredEmails = allEmails.filter(email => {
        // Filter by folder
        if (folderId && folderId !== 'inbox') {
          const hasMatchingLabel = email.labels?.includes(folderId.toLowerCase());
          if (!hasMatchingLabel) return false;
        }

        // If search query exists, filter by that too
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const searchableContent = [
            email.subject.toLowerCase(),
            email.from.name.toLowerCase(),
            email.from.email.toLowerCase(),
            email.body.toLowerCase()
          ].join(' ');

          return searchableContent.includes(query);
        }

        return true;
      });

      setEmails(filteredEmails);
      setTotalEmails(filteredEmails.length + (page - 1) * pageSize); // Rough estimate
      console.log('Filtered emails for display:', filteredEmails);
    } catch (err) {
      console.error('Error loading emails:', err);
      setError(err instanceof Error ? err.message : 'Failed to load emails');
      toast({
        title: "Failed to load emails",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get a random woodland title for contacts
  const getWoodlandTitle = (email: string) => {
    const titles = [
      'Forest Guardian',
      'Leaf Whisperer',
      'Woodland Sage',
      'Mushroom Keeper',
      'Acorn Collector',
      'Fern Friend',
      'Shadow Dancer',
      'Dew Gatherer',
      'Moonlight Guide',
      'Tree Speaker'
    ];
    
    // Use email as a seed for deterministic but random-looking selection
    const charSum = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return titles[charSum % titles.length];
  };

  // Load emails on component mount and when dependencies change
  useEffect(() => {
    console.log('EmailList dependencies changed, reloading emails');
    loadEmails();
  }, [token, folderId, searchQuery, page, pageSize, refreshKey]);

  // Handle refresh action
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Handle opening an email
  const handleOpenEmail = (email: Email) => {
    setSelectedEmail(email);
    
    // Mark as read if not already
    if (!email.read) {
      // In a real app, we would update the server here
      const updatedEmails = emails.map(e => 
        e.id === email.id ? { ...e, read: true } : e
      );
      setEmails(updatedEmails);
    }
  };

  // Handle closing the email detail view
  const handleCloseEmail = () => {
    setSelectedEmail(null);
  };

  // Format date to human readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If it's today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!token) {
    return (
      <div className="p-6 forest-card text-center">
        <p>Please log in to view your emails.</p>
        <button 
          onClick={() => navigate('/login')}
          className="mt-4 forest-btn-primary"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading && !emails.length) {
    return (
      <div className="p-6 forest-card">
        <div className="flex justify-center items-center">
          <RefreshCw className="animate-spin h-6 w-6 mr-2 text-forest-bark" />
          <p>Loading messages from the forest...</p>
        </div>
      </div>
    );
  }

  if (error && !emails.length) {
    return (
      <div className="p-6 forest-card bg-red-50 border border-red-300">
        <h3 className="text-lg font-bold text-red-800">Error loading messages</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="p-6 forest-card text-center">
        <img src="/empty-folder.png" alt="Empty folder" className="mx-auto h-32 mb-4 opacity-60" />
        <h3 className="text-xl font-bold mb-2">This branch is empty</h3>
        <p className="text-forest-bark/70 mb-4">
          No messages have landed here yet. They might be resting in another branch.
        </p>
        <button 
          onClick={handleRefresh}
          className="forest-btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
    );
  }

  // Email detail view
  if (selectedEmail) {
    return (
      <div className="forest-card overflow-hidden backdrop-blur-sm animate-fade-in woodland-shadow">
        <div className="flex justify-between items-center p-4 border-b border-forest-moss">
          <button onClick={handleCloseEmail} className="font-medium text-forest-leaf hover:underline flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to {folderId === 'sent' ? 'Sent Butterflies' : 'Inbox'}
          </button>
          <div className="text-sm text-forest-bark/70">
            {formatDate(selectedEmail.received)}
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-forest-bark">{selectedEmail.subject}</h2>
          
          <div className="flex items-center mb-6">
            <div className="relative">
              <img 
                src={selectedEmail.from.avatar || '/avatar-fox.png'} 
                alt={selectedEmail.from.animal || 'fox'} 
                className="w-12 h-12 rounded-full border-2 border-forest-leaf animate-float"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-xs">
                  {selectedEmail.from.animal === 'fox' ? '🦊' :
                   selectedEmail.from.animal === 'owl' ? '🦉' :
                   selectedEmail.from.animal === 'rabbit' ? '🐰' :
                   selectedEmail.from.animal === 'squirrel' ? '🐿️' :
                   selectedEmail.from.animal === 'cat' ? '🐱' :
                   selectedEmail.from.animal === 'dog' ? '🐶' :
                   selectedEmail.from.animal === 'bird' ? '🐦' : '🦊'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="font-medium text-forest-berry">
                {selectedEmail.from.animal ? `${selectedEmail.from.animal.charAt(0).toUpperCase() + selectedEmail.from.animal.slice(1)} of the Woods` : selectedEmail.from.name}
              </div>
              <div className="text-sm text-forest-bark/70">{selectedEmail.from.email}</div>
              <div className="text-xs text-forest-leaf font-medium">
                {selectedEmail.from.woodlandName || getWoodlandTitle(selectedEmail.from.email)}
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none text-forest-bark/90 bg-forest-cream/50 p-4 rounded-lg border border-forest-moss/30">
            <p>{selectedEmail.body}</p>
          </div>
        </div>
      </div>
    );
  }

  // Email list view
  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <div className="text-sm text-forest-bark/70">
          {emails.length} message{emails.length !== 1 ? 's' : ''} {searchQuery && `matching "${searchQuery}"`}
        </div>
        <button 
          onClick={handleRefresh} 
          className="p-2 text-forest-leaf hover:text-forest-bark flex items-center gap-1 rounded-lg hover:bg-forest-moss/30 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="space-y-3">
        {emails.map((email, index) => (
          <div 
            key={email.id}
            onClick={() => handleOpenEmail(email)}
            className={`forest-card p-4 cursor-pointer transition-all hover:woodland-shadow hover:-translate-y-1 animate-pop ${
              !email.read ? 'bg-forest-moss/40 border-l-4 border-l-forest-leaf' : 'bg-forest-cream/80'
            }`}
            style={{ 
              animationDelay: `${index * 0.05}s`,
              transform: `rotate(${Math.sin(index * 0.5) * 0.5}deg)`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative mr-3">
                  <img 
                    src={email.from.avatar || '/avatar-fox.png'} 
                    alt={email.from.name} 
                    className={`w-10 h-10 rounded-full border-2 ${!email.read ? 'border-forest-leaf animate-float' : 'border-forest-moss'}`}
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs">
                      {email.from.animal === 'fox' ? '🦊' :
                       email.from.animal === 'owl' ? '🦉' :
                       email.from.animal === 'rabbit' ? '🐰' :
                       email.from.animal === 'squirrel' ? '🐿️' :
                       email.from.animal === 'cat' ? '🐱' :
                       email.from.animal === 'dog' ? '🐶' :
                       email.from.animal === 'bird' ? '🐦' : '🦊'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className={`font-medium ${!email.read ? 'font-bold text-forest-bark' : 'text-forest-berry'}`}>
                    {email.from.animal ? `${email.from.animal.charAt(0).toUpperCase() + email.from.animal.slice(1)} of the Woods` : email.from.name}
                  </div>
                  <div className="text-xs text-forest-bark/70">{email.from.email}</div>
                  <div className="text-xs text-forest-leaf">
                    {email.from.woodlandName || getWoodlandTitle(email.from.email)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-forest-bark/70">
                {formatDate(email.received)}
              </div>
            </div>
            <div className={`mt-2 ${!email.read ? 'font-semibold text-forest-bark' : 'text-forest-bark/90'}`}>
              {email.subject}
            </div>
            <div className="mt-1 text-sm text-forest-bark/70 line-clamp-2 bg-white/40 p-2 rounded-lg">
              {email.body.length > 120 ? `${email.body.substring(0, 120)}...` : email.body}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination using shadcn/ui component */}
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => page > 1 && onPageChange(page - 1)}
              className={`forest-btn-outline ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-forest-moss/30'}`}
            />
          </PaginationItem>
          
          {page > 1 && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(page - 1)} 
                className="cursor-pointer bg-forest-moss/30 text-forest-bark hover:bg-forest-moss/50"
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationLink 
              isActive 
              className="bg-forest-leaf text-white hover:bg-forest-leaf/80"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
          
          {emails.length === pageSize && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(page + 1)}
                className="cursor-pointer bg-forest-moss/30 text-forest-bark hover:bg-forest-moss/50"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => emails.length === pageSize && onPageChange(page + 1)}
              className={`forest-btn-outline ${emails.length < pageSize ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-forest-moss/30'}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
