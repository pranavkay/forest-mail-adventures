import { useState, useEffect } from 'react';
import { contacts, getWoodlandName } from '@/data/mockData';
import { Mail, Phone, Search, Menu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ContactList } from '@/components/ContactList';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/Sidebar';

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    contact => contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSendLetter = (email: string) => {
    // In a real app, this would navigate to compose with pre-filled recipient
    toast({
      title: "Sending a forest letter",
      description: `Preparing a message for ${email}`,
    });
  };
  
  const handleContactCall = (contact: any) => {
    toast({
      title: "Forest Call Initiated",
      description: `Calling ${contact.name} through the magical forest...`,
    });
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar-container');
      const toggleButton = document.querySelector('.sidebar-toggle');

      if (
        showSidebar &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node)
      ) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50 sidebar-toggle">
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 bg-forest-leaf text-white rounded-full shadow-lg"
        >
          <Menu size={20} />
        </button>
      </div>
      
      {/* Sidebar - hidden on mobile by default, shown when toggled */}
      <div className={`sidebar-container fixed md:relative z-40 transition-transform duration-300 ease-in-out h-screen ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto p-4 md:p-6 leaf-bg pt-16 md:pt-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 border-forest-moss/30 bg-gradient-to-br from-forest-cream/80 to-white shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl md:text-2xl font-bold text-forest-bark">Woodland Friends</CardTitle>
              <CardDescription className="text-forest-bark/70">Your magical forest companions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest-bark/50 h-4 w-4" />
                  <Input
                    placeholder="Search woodland friends..."
                    className="pl-9 bg-white/80 border-forest-moss/30 focus-visible:ring-forest-leaf"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 self-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "px-3", 
                      viewMode === 'grid' ? 'bg-forest-moss/20 text-forest-bark' : 'text-forest-bark/70'
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "px-3", 
                      viewMode === 'list' ? 'bg-forest-moss/20 text-forest-bark' : 'text-forest-bark/70'
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* ContactList component if list view is selected */}
          {viewMode === 'list' && (
            <ContactList showExpanded={true} />
          )}
          
          {/* Grid view for contacts */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <Card 
                  key={contact.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-forest-moss/30 bg-gradient-to-br from-white to-forest-cream/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-forest-moss flex items-center justify-center text-white shadow-inner animate-float">
                        <div className="text-lg md:text-xl font-bold">{contact.name.charAt(0)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-forest-bark truncate">{contact.name}</h3>
                        <p className="text-xs md:text-sm text-forest-bark/70 italic truncate">
                          {getWoodlandName(contact)}
                        </p>
                        <p className="text-xs md:text-sm text-forest-bark/70 truncate">{contact.email}</p>
                        <div className="mt-2 md:mt-3 flex flex-wrap gap-2 md:gap-3">
                          <button 
                            className="text-xs md:text-sm text-forest-berry hover:text-forest-berry/80 flex items-center"
                            onClick={() => handleSendLetter(contact.email)}
                          >
                            <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            Send letter
                          </button>
                          <button 
                            className="text-xs md:text-sm text-forest-leaf hover:text-forest-leaf/80 flex items-center"
                            onClick={() => handleContactCall(contact)}
                          >
                            <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            Forest call
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredContacts.length === 0 && (
            <div className="forest-card p-8 text-center">
              <p className="text-forest-bark">No woodland friends found with that name.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
