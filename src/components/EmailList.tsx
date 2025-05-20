import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Email } from '@/types/email';
import { format } from 'date-fns';
import { fetchEmails } from '@/services/gmailService';
import { useUser } from '@/context/UserContext';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";
import { GmailSetupGuide } from './GmailSetupGuide';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from './ui/pagination';

interface EmailListProps {
  folderId?: string;
  searchQuery?: string;
}

export const EmailList = ({ folderId = 'inbox', searchQuery = '' }: EmailListProps) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, logout, tokenObject, getAccessToken } = useUser();
  const [needsPermissions, setNeedsPermissions] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const emailsPerPage = 10;
  
  const loadEmails = async (page = 1, force = false) => {
    if (!token) {
      console.log('No auth token available, using mock data');
      setEmails(require('@/data/mockData').emails);
      return;
    }

    // If emails are already loaded and we're not forcing a reload, just paginate the existing emails
    if (emails.length > 0 && !force && page === 1) {
      console.log('Using already loaded emails');
      return;
    }

    setIsLoading(true);
    setError(null);
    setNeedsPermissions(false);
    
    try {
      console.log(`Loading emails from Gmail API for page ${page}`);
      console.log('Token available:', token ? 'Yes' : 'No');
      
      // Pass pagination parameters to the fetchEmails function
      const gmailEmails = await fetchEmails(token, (page - 1) * emailsPerPage, emailsPerPage);
      
      if (gmailEmails && gmailEmails.length > 0) {
        console.log(`Loaded ${gmailEmails.length} emails from Gmail`);
        
        if (page === 1 || force) {
          setEmails(gmailEmails);
        } else {
          // Append new emails to existing ones, avoiding duplicates
          const existingIds = new Set(emails.map(email => email.id));
          const uniqueNewEmails = gmailEmails.filter(email => !existingIds.has(email.id));
          setEmails(prev => [...prev, ...uniqueNewEmails]);
        }
        
        // Set estimated total based on API response (could be implemented in the service)
        setTotalEmails(Math.max(gmailEmails.length + (page - 1) * emailsPerPage, emails.length));
        
        toast({
          title: "Emails loaded successfully",
          description: `Retrieved emails for page ${page}.`,
        });
      } else if (page === 1) {
        console.log('No Gmail emails found, using mock data');
        const mockEmails = require('@/data/mockData').emails;
        setEmails(mockEmails);
        setTotalEmails(mockEmails.length);
        toast({
          title: "No emails found",
          description: "We couldn't find any emails in your account. Showing sample data instead.",
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch emails:', error);
      
      // Check for specific error types
      if (error.message?.includes('Permission denied') || error.message?.includes('Gmail permissions')) {
        setError(error.message);
        setNeedsPermissions(true);
        toast({
          title: "Gmail permissions required",
          description: "Please log out and log in again, making sure to approve all permission requests.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Authentication failed')) {
        setError("Authentication failed. Please log in again.");
        toast({
          title: "Session expired",
          description: "Your login session has expired. Please log in again.",
          variant: "destructive",
        });
        
        // Automatically log out after a delay
        setTimeout(() => {
          logout();
        }, 3000);
      } else {
        setError(error.message || "Error connecting to emails");
        toast({
          title: "Couldn't load emails",
          description: "There was a problem connecting to your email. Using sample data instead.",
          variant: "destructive",
        });
      }
      
      // Fall back to mock data on error
      const mockEmails = require('@/data/mockData').emails;
      setEmails(mockEmails);
      setTotalEmails(mockEmails.length);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load emails when the token or page changes
  useEffect(() => {
    loadEmails(currentPage);
  }, [token, currentPage]);
  
  // Filter emails whenever folder, search query, or emails change
  useEffect(() => {
    console.log(`Filtering emails for folder: ${folderId}, search: "${searchQuery}"`);
    
    let filtered = emails;
    
    // Apply folder filter
    if (folderId && folderId !== 'inbox') {
      filtered = filtered.filter(email => email.labels?.includes(folderId));
    }
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(query) || 
        email.body.toLowerCase().includes(query) ||
        email.from.name.toLowerCase().includes(query) ||
        email.from.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredEmails(filtered);
    
  }, [emails, folderId, searchQuery]);
  
  const selectedEmail = filteredEmails.find(email => email.id === selectedEmailId);
  
  const handleEmailClick = (emailId: string) => {
    setSelectedEmailId(emailId);
    setIsEmailOpen(true);
  };
  
  const handleBack = () => {
    setIsEmailOpen(false);
  };
  
  const handleRetry = () => {
    loadEmails(1, true);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalEmails / emailsPerPage);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate middle pages to show
      if (currentPage <= 3) {
        // Near the beginning
        pages.push(2, 3);
        pages.push(0); // Placeholder for ellipsis
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(0); // Placeholder for ellipsis
        pages.push(totalPages - 2, totalPages - 1);
      } else {
        // Somewhere in the middle
        pages.push(0); // Placeholder for ellipsis
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push(0); // Placeholder for ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <div className="w-full">
      {!isEmailOpen ? (
        <div className="space-y-4">
          {needsPermissions && <GmailSetupGuide />}
        
          <div className="forest-card">
            <h2 className="text-xl font-semibold text-forest-bark mb-1">
              {folderId === 'inbox' 
                ? 'Leaf Pile' 
                : folderId.charAt(0).toUpperCase() + folderId.slice(1) + ' Messages'
              }
            </h2>
            <p className="text-sm text-forest-bark/70 mb-4">
              {searchQuery 
                ? `Searched for "${searchQuery}" - ${filteredEmails.length} results` 
                : `Page ${currentPage} of your forest messages`
              }
            </p>
            
            {error && !needsPermissions && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <span>{error}</span>
                  <div className="flex gap-2">
                    {error.includes('Authentication failed') && (
                      <button 
                        onClick={logout} 
                        className="bg-destructive/10 hover:bg-destructive/20 px-3 py-1 rounded flex items-center gap-2"
                      >
                        Log out
                      </button>
                    )}
                    <button 
                      onClick={handleRetry} 
                      className="bg-destructive/10 hover:bg-destructive/20 px-3 py-1 rounded flex items-center gap-2"
                    >
                      <ReloadIcon className="h-4 w-4" /> Retry
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {isLoading && (
              <div className="flex justify-center p-4">
                <div className="w-8 h-8 border-4 border-t-forest-leaf border-forest-moss/30 rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="space-y-2">
              {filteredEmails.map((email) => (
                <EmailCard 
                  key={email.id} 
                  email={email} 
                  onClick={() => handleEmailClick(email.id)}
                />
              ))}
            </div>
            
            {filteredEmails.length === 0 && !isLoading && (
              <div className="text-center py-8 text-forest-bark/70">
                No messages found in this part of the forest
              </div>
            )}
            
            {!isLoading && totalPages > 1 && (
              <div className="mt-6 pt-3 border-t border-forest-moss/30">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                    
                    {getPageNumbers().map((page, index) => 
                      page === 0 ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="cursor-pointer" 
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmailDetail email={selectedEmail} onBack={handleBack} />
      )}
    </div>
  );
};

const EmailCard = ({ email, onClick }: { email: Email, onClick: () => void }) => {
  const date = new Date(email.received);
  const formattedDate = format(date, 'MMM d');
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl cursor-pointer transition-all hover:shadow-md animate-float",
        email.read ? "bg-white/60" : "bg-forest-moss/30 font-medium",
      )}
      style={{
        animationDelay: `${Math.random() * 2}s`
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-forest-moss flex items-center justify-center text-forest-leaf mr-3">
            {email.from.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold text-forest-bark group relative">
              <span className="absolute transition-opacity duration-200 opacity-100 group-hover:opacity-0">
                {email.from.woodlandName}
              </span>
              <span className="absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                {email.from.name}
              </span>
            </div>
            <div className="text-xs text-forest-bark/70 mt-5">{email.subject}</div>
          </div>
        </div>
        <div className="text-xs text-forest-bark/70">{formattedDate}</div>
      </div>
    </div>
  );
};

const EmailDetail = ({ email, onBack }: { email: Email | undefined, onBack: () => void }) => {
  if (!email) return null;
  
  const date = new Date(email.received);
  const formattedDate = format(date, 'MMM d, yyyy h:mm a');
  
  return (
    <div className="forest-card animate-pop">
      <button 
        onClick={onBack}
        className="mb-4 text-forest-berry hover:text-forest-berry/80 font-medium flex items-center"
      >
        ← Back to Leaf Pile
      </button>
      
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-forest-bark mb-1">{email.subject}</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-forest-moss flex items-center justify-center text-forest-leaf mr-3">
              {email.from.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{email.from.name}</div>
              <div className="text-xs text-forest-bark/60">as {email.from.woodlandName}</div>
              <div className="text-xs text-forest-bark/70">{email.from.email}</div>
            </div>
          </div>
          <div className="text-sm text-forest-bark/70">{formattedDate}</div>
        </div>
      </div>
      
      <div className="border-t border-forest-moss/30 pt-4 text-forest-bark">
        <p>{email.body}</p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-forest-moss/30 flex justify-between">
        <div>
          <button className="forest-btn-primary mr-2">
            Reply
          </button>
          <button className="forest-btn-secondary">
            Forward
          </button>
        </div>
        <button className="forest-btn-neutral flex items-center">
          <span>Feed to Beaver</span>
        </button>
      </div>
    </div>
  );
};
