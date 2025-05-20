
import { useUser } from '@/context/UserContext';
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const GmailSetupGuide = () => {
  const { logout } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <Alert className="mb-6">
      <AlertTitle className="font-semibold">Gmail Setup Required</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p className="text-sm">
            To connect your Gmail account properly, you need to ensure your Google OAuth consent screen has the correct scopes enabled:
          </p>
          
          {isExpanded ? (
            <div className="mt-3 space-y-3 text-sm">
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Go to the <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>Select your project</li>
                <li>Navigate to "OAuth consent screen"</li>
                <li>Under "Scopes", make sure these scopes are added:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>https://www.googleapis.com/auth/gmail.readonly (for reading emails)</li>
                    <li>https://www.googleapis.com/auth/gmail.send (for sending emails)</li>
                  </ul>
                </li>
                <li>After updating scopes, users will need to authorize again with the new permissions</li>
              </ol>
              
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={handleLogout}
                  className="bg-forest-moss/30 hover:bg-forest-moss/40 px-3 py-2 rounded text-forest-bark"
                >
                  Log out and try again
                </button>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="text-forest-bark/70 hover:text-forest-bark"
                >
                  Hide details
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-forest-berry hover:text-forest-berry/80"
              >
                Show setup instructions
              </button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
