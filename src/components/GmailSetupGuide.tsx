
import { useUser } from '@/context/UserContext';
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from 'lucide-react';

export const GmailSetupGuide = () => {
  const { logout } = useUser();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <Alert className="mb-6 border-forest-berry/40 bg-forest-berry/5">
      <AlertTitle className="flex items-center text-lg font-semibold text-forest-berry">
        <AlertTriangle className="mr-2 h-5 w-5" /> 
        Gmail Permission Required
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-3 py-2">
          <p>
            Forest Mail needs permission to read and send emails with your Gmail account. This allows us to display your emails and send messages through our interface.
          </p>
          
          <div className="bg-white/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-forest-moss" />
              <span>Read emails from your Gmail account</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-forest-moss" />
              <span>Send emails through our interface</span>
            </div>
          </div>
          
          <p className="text-sm">
            Please log out and sign in again, making sure to allow these permissions when prompted.
          </p>
          
          <div className="mt-3">
            <button 
              onClick={handleLogout}
              className="bg-forest-berry hover:bg-forest-berry/90 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              Log out and try again
            </button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
