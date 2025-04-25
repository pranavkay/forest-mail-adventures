
import { contacts } from '@/data/mockData';
import { Mail, Contact as ContactIcon } from 'lucide-react';

const Contacts = () => {
  return (
    <div className="flex-1 overflow-auto p-6 leaf-bg">
      <div className="max-w-4xl mx-auto">
        <div className="forest-card p-6 mb-6">
          <h1 className="text-2xl font-bold text-forest-bark mb-2">Woodland Friends</h1>
          <p className="text-forest-bark/70">Your magical forest companions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="forest-card p-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-forest-moss flex items-center justify-center text-forest-leaf">
                  <ContactIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-forest-bark">{contact.name}</h3>
                  <p className="text-sm text-forest-bark/70 italic">
                    Known as: {getWoodlandName(contact.animal)}
                  </p>
                  <p className="text-sm text-forest-bark/70">{contact.email}</p>
                  <div className="mt-3">
                    <button className="text-sm text-forest-berry hover:text-forest-berry/80 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Send a letter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getWoodlandName = (animal: string): string => {
  switch (animal) {
    case 'fox':
      return 'Wise Fox';
    case 'rabbit':
      return 'Swift Rabbit';
    case 'owl':
      return 'Sage Owl';
    case 'squirrel':
      return 'Nimble Squirrel';
    case 'cat':
      return 'Silent Cat';
    case 'dog':
      return 'Loyal Dog';
    case 'bird':
      return 'Singing Bird';
    default:
      return 'Forest Friend';
  }
};

export default Contacts;
