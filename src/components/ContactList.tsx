
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { contacts, Contact, getWoodlandName } from '@/data/mockData';
import { Bird, Cat, Dog, Leaf, Mail, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const getAnimalIcon = (animal: string) => {
  switch (animal) {
    case 'fox':
      return <Dog className="w-5 h-5" />;  // Using Dog as stand-in for fox
    case 'rabbit':
      return <Dog className="w-5 h-5" />; // Using Dog as stand-in for rabbit
    case 'owl':
      return <Bird className="w-5 h-5" />;
    case 'squirrel':
      return <Cat className="w-5 h-5" />; // Using Cat as stand-in for squirrel
    case 'cat':
      return <Cat className="w-5 h-5" />;
    case 'dog':
      return <Dog className="w-5 h-5" />;
    case 'bird':
      return <Bird className="w-5 h-5" />;
    default:
      return <Leaf className="w-5 h-5" />;
  }
};

interface ContactListProps {
  showExpanded?: boolean;
  limit?: number;
}

export const ContactList = ({ showExpanded = false, limit }: ContactListProps) => {
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  
  const handleSendLetter = (email: string) => {
    toast({
      title: "Sending a forest letter",
      description: `Preparing a message for ${email}`,
    });
  };
  
  const displayContacts = limit 
    ? contacts.slice(0, limit) 
    : isExpanded 
      ? contacts 
      : contacts.slice(0, 3);
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-forest-bark">Woodland Friends</h3>
        {!showExpanded && (
          <Button
            variant="link"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-forest-berry hover:text-forest-berry/80 p-0 h-auto"
          >
            {isExpanded ? 'Hide' : 'Show All'}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {displayContacts.map((contact) => (
          <ContactCard 
            key={contact.id} 
            contact={contact} 
            onSendLetter={() => handleSendLetter(contact.email)} 
          />
        ))}
      </div>
    </div>
  );
};

interface ContactCardProps {
  contact: Contact;
  onSendLetter: () => void;
}

const ContactCard = ({ contact, onSendLetter }: ContactCardProps) => {
  return (
    <Card className="flex items-center p-3 border-forest-moss/30 bg-gradient-to-r from-white to-forest-cream/30 hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-forest-moss flex items-center justify-center text-white">
          {getAnimalIcon(contact.animal || 'fox')}
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-forest-leaf border-2 border-white"></div>
      </div>
      <div className="ml-3 flex-1">
        <div className="text-sm font-medium text-forest-bark">{contact.name}</div>
        <div className="text-xs text-forest-bark/70 italic">{getWoodlandName(contact)}</div>
        <div className="text-xs text-forest-bark/70">{contact.email}</div>
      </div>
      <div className="flex space-x-2 ml-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-forest-moss/20 text-forest-berry"
          onClick={onSendLetter}
        >
          <Mail className="h-4 w-4" />
          <span className="sr-only">Send letter</span>
        </Button>
      </div>
    </Card>
  );
};
