
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { emails as mockEmails } from '@/data/mockData';
import { format } from 'date-fns';
import { fetchEmails } from '@/services/gmailService';
import { useUser } from '@/context/UserContext';

export const EmailList = () => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emails, setEmails] = useState(mockEmails);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useUser();
  
  useEffect(() => {
    const loadEmails = async () => {
      if (token) {
        setIsLoading(true);
        try {
          const gmailEmails = await fetchEmails(token);
          // Transform ForestEmail to match Email format
          const transformedEmails = gmailEmails.map(email => ({
            ...email,
            from: {
              id: email.from.id,
              name: email.from.name,
              woodlandName: email.from.woodlandName,
              email: email.from.email,
              avatar: email.from.avatar,
              animal: email.from.animal
            }
          }));
          // In a real application, we might merge or replace local emails
          setEmails([...transformedEmails, ...mockEmails]);
        } catch (error) {
          console.error('Failed to fetch emails:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadEmails();
  }, [token]);
  
  const selectedEmail = emails.find(email => email.id === selectedEmailId);
  
  const handleEmailClick = (emailId: string) => {
    setSelectedEmailId(emailId);
    setIsEmailOpen(true);
  };
  
  const handleBack = () => {
    setIsEmailOpen(false);
  };
  
  return (
    <div className="w-full">
      {!isEmailOpen ? (
        <div className="space-y-4">
          <div className="forest-card">
            <h2 className="text-xl font-semibold text-forest-bark mb-1">Leaf Pile</h2>
            <p className="text-sm text-forest-bark/70 mb-4">Your recent messages from the forest</p>
            
            {isLoading && (
              <div className="flex justify-center p-4">
                <div className="w-8 h-8 border-4 border-t-forest-leaf border-forest-moss/30 rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="space-y-2">
              {emails.map((email) => (
                <EmailCard 
                  key={email.id} 
                  email={email} 
                  onClick={() => handleEmailClick(email.id)}
                />
              ))}
            </div>
            
            {emails.length === 0 && !isLoading && (
              <div className="text-center py-8 text-forest-bark/70">
                No messages found in your forest
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

const EmailCard = ({ email, onClick }: { email: typeof mockEmails[0], onClick: () => void }) => {
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

const EmailDetail = ({ email, onBack }: { email: typeof mockEmails[0] | undefined, onBack: () => void }) => {
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
