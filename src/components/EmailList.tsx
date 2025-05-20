import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { fetchEmails } from '@/data/mockData';
import { Email } from '@/types/email';
import { useUser } from '@/context/UserContext';
import { RefreshCw, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";

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

  // Get a whimsical woodland name based on email
  const getWhimsicalName = (email: string) => {
    const firstNames = [
      'Whisperleaf', 'Moonbeam', 'Dappleshade', 'Twinkling', 'Dewdrop', 
      'Brambleheart', 'Starlight', 'Mistybrook', 'Fernwhistle', 'Honeyglow',
      'Thistledown', 'Shimmerwind', 'Ripplecreek', 'Amberbark', 'Frostwhisper',
      'Willowsong', 'Cinderpath', 'Embergleam', 'Hazelnut', 'Pinecone'
    ];
    
    const secondNames = [
      'Whisperer', 'Keeper', 'Guardian', 'Warden', 'Wanderer',
      'Dreamer', 'Dancer', 'Weaver', 'Seeker', 'Explorer',
      'Sage', 'Tracker', 'Healer', 'Collector', 'Sentinel',
      'Ranger', 'Storyteller', 'Forager', 'Watcher', 'Guide'
    ];
    
    // Use email as a seed for deterministic but unique selection
    const charSum = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const firstName = firstNames[charSum % firstNames.length];
    const secondName = secondNames[(charSum * 13) % secondNames.length];
    
    return `${firstName} ${secondName}`;
  };

  // Generate a woodland creature emoji based on email
  const getWoodlandEmoji = (email: string) => {
    const emojis = ['🦊', '🦉', '🦡', '🐿️', '🦝', '🐇', '🦔', '🐿️', '🍄', '🦌', '🐺', '🦢', '🦅', '🦇', '🐸'];
    const charSum = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return emojis[charSum % emojis.length];
  };
  
  // Generate a pastel color based on email
  const getPastelColor = (email: string) => {
    const colors = [
      '#FFD6E0', '#FFEFCF', '#D4F0F0', '#E2F0CB', '#E0DAFE', 
      '#F0E6D2', '#D5E8D4', '#D5F2E3', '#F6D7F1', '#FAD6B8'
    ];
    const charSum = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
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

  // Enhanced email body formatting
  const formatEmailBody = (body: string) => {
    // Replace URLs with hyperlinks
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withLinks = body.replace(urlRegex, '<a href="$1" class="text-forest-leaf underline hover:text-forest-berry" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert line breaks to HTML
    const withLineBreaks = withLinks.replace(/\n/g, '<br />');
    
    // Split paragraphs
    const paragraphs = withLineBreaks.split('<br /><br />');
    
    return (
      <>
        {paragraphs.map((paragraph, index) => (
          <p 
            key={index} 
            className={`mb-3 ${index === 0 ? 'text-lg' : ''}`}
            dangerouslySetInnerHTML={{ __html: paragraph }}
          />
        ))}
      </>
    );
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
            <div className="relative mr-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center animate-float"
                style={{ 
                  backgroundColor: getPastelColor(selectedEmail.from.email),
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <span className="text-2xl">{getWoodlandEmoji(selectedEmail.from.email)}</span>
              </div>
            </div>
            <div>
              <div className="font-medium text-forest-berry">
                {getWhimsicalName(selectedEmail.from.email)}
              </div>
              <div className="text-sm text-forest-bark/70">{selectedEmail.from.email}</div>
              <div className="text-xs text-forest-bark/80">
                {selectedEmail.from.name}
              </div>
            </div>
          </div>
          
          <Card className="overflow-hidden shadow-md">
            <CardContent className="prose max-w-none text-forest-bark/90 bg-gradient-to-b from-forest-cream/70 to-white/90 p-6 rounded-lg">
              {formatEmailBody(selectedEmail.body)}
            </CardContent>
          </Card>
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
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${!email.read ? 'animate-float' : ''}`}
                    style={{ 
                      backgroundColor: getPastelColor(email.from.email),
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span className="text-xl">{getWoodlandEmoji(email.from.email)}</span>
                  </div>
                </div>
                <div>
                  <div className={`font-medium ${!email.read ? 'font-bold text-forest-bark' : 'text-forest-berry'}`}>
                    {getWhimsicalName(email.from.email)}
                  </div>
                  <div className="text-xs text-forest-bark/70">{email.from.email}</div>
                  <div className="text-xs text-forest-bark/80">
                    {email.from.name}
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
