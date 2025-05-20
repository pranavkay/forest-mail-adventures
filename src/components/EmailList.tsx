import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { fetchEmails } from '@/data/mockData';
import { Email } from '@/types/email';
import { useUser } from '@/context/UserContext';
import { RefreshCw } from 'lucide-react';

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

  // Handle pagination
  const handleNextPage = () => {
    onPageChange(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
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
          className="mt-4 forest-button"
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
          className="forest-button inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
    );
  }

  // Email detail view
  if (selectedEmail) {
    return (
      <div className="forest-card overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-forest-border">
          <button onClick={handleCloseEmail} className="font-medium text-forest-accent hover:underline">
            ← Back to {folderId === 'sent' ? 'Sent Butterflies' : 'Inbox'}
          </button>
          <div className="text-sm text-forest-bark/70">
            {formatDate(selectedEmail.received)}
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h2>
          
          <div className="flex items-center mb-6">
            <div className="relative">
              <img 
                src={selectedEmail.from.avatar || '/avatar-fox.png'} 
                alt={selectedEmail.from.name} 
                className="w-12 h-12 rounded-full border-2 border-forest-accent"
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
              <div className="font-medium">{selectedEmail.from.name}</div>
              <div className="text-sm text-forest-bark/70">{selectedEmail.from.email}</div>
              <div className="text-xs text-forest-bark/50">
                {selectedEmail.from.woodlandName || 'Forest Dweller'}
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none">
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
          className="p-2 text-forest-accent hover:text-forest-bark flex items-center gap-1 rounded-lg hover:bg-forest-bg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="space-y-2">
        {emails.map(email => (
          <div 
            key={email.id}
            onClick={() => handleOpenEmail(email)}
            className={`forest-card p-4 cursor-pointer transition-all ${
              !email.read ? 'bg-forest-bg border-l-4 border-l-forest-accent' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative mr-3">
                  <img 
                    src={email.from.avatar || '/avatar-fox.png'} 
                    alt={email.from.name} 
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[8px]">
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
                  <div className={`font-medium ${!email.read ? 'font-bold' : ''}`}>{email.from.name}</div>
                  <div className="text-xs text-forest-bark/70">{email.from.email}</div>
                </div>
              </div>
              <div className="text-xs text-forest-bark/70">
                {formatDate(email.received)}
              </div>
            </div>
            <div className={`mt-2 ${!email.read ? 'font-semibold' : ''}`}>
              {email.subject}
            </div>
            <div className="mt-1 text-sm text-forest-bark/70 line-clamp-2">
              {email.body.length > 120 ? `${email.body.substring(0, 120)}...` : email.body}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination controls */}
      <div className="mt-6 flex justify-between">
        <button 
          onClick={handlePrevPage}
          disabled={page === 1}
          className={`forest-button ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous
        </button>
        <div className="text-forest-bark">
          Page {page}
        </div>
        <button 
          onClick={handleNextPage}
          disabled={emails.length < pageSize}
          className={`forest-button ${emails.length < pageSize ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
