
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { contacts, Contact } from '@/data/mockData';
import { Bird, Cat, Dog, Leaf } from 'lucide-react';

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

export const ContactList = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-forest-bark">Woodland Friends</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-forest-berry hover:underline"
        >
          {isExpanded ? 'Hide' : 'Show All'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {contacts
          .slice(0, isExpanded ? contacts.length : 3)
          .map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
      </div>
    </div>
  );
};

const ContactCard = ({ contact }: { contact: Contact }) => {
  return (
    <div className="forest-card flex items-center p-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-forest-moss flex items-center justify-center text-forest-leaf">
          {getAnimalIcon(contact.animal)}
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-forest-leaf border-2 border-white"></div>
      </div>
      <div className="ml-3">
        <div className="text-sm font-medium">{contact.name}</div>
        <div className="text-xs text-forest-bark/70">{contact.email}</div>
      </div>
    </div>
  );
};
