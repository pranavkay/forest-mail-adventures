
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { contacts } from '@/data/mockData';

export const ComposeEmail = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    console.log('Sending email:', { recipient, subject, message });
    // Here we would handle the actual sending logic
    
    // Reset form and close compose window
    setRecipient('');
    setSubject('');
    setMessage('');
    setIsOpen(false);
  };
  
  const handleSaveDraft = () => {
    console.log('Saving draft:', { recipient, subject, message });
    // Here we would handle saving to drafts
    setIsOpen(false);
  };
  
  return (
    <>
      {/* Floating compose button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-forest-leaf shadow-lg flex items-center justify-center text-white hover:bg-forest-leaf/90 transition-all"
        >
          <span className="text-2xl">✉️</span>
        </button>
      )}
      
      {/* Compose email modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 animate-pop">
            <div className="p-4 border-b border-forest-moss/30 flex justify-between items-center">
              <h2 className="text-xl font-medium text-forest-bark">Compose Message Butterfly</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-forest-bark/70 hover:text-forest-bark"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-bark mb-1">
                  To:
                </label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="forest-input w-full"
                >
                  <option value="">Choose a woodland friend</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.email}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-bark mb-1">
                  Subject:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's your message about?"
                  className="forest-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-bark mb-1">
                  Message:
                </label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full rounded-xl px-4 py-2 bg-white/80 border border-forest-moss focus:border-forest-leaf focus:ring-1 focus:ring-forest-leaf focus:outline-none"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-forest-moss/30 flex justify-between">
              <div>
                <button 
                  onClick={handleSaveDraft}
                  className="forest-btn bg-forest-moss text-forest-bark hover:bg-forest-moss/80"
                >
                  Store in Mushroom Pocket
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={!recipient || !subject || !message}
                className={cn(
                  "forest-btn-primary flex items-center",
                  (!recipient || !subject || !message) && "opacity-50 cursor-not-allowed"
                )}
              >
                <span>Release your message butterfly</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
