
import { useUser } from '@/context/UserContext';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const GmailSetupGuide = () => {
  const { logout } = useUser();
  
  const handleLogout = () => {
    // Clear any localStorage data before logout
    localStorage.clear();
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
            Forest Mail needs permission to read and send emails with your Gmail account. It appears you didn't grant these permissions during login.
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
          
          <div className="bg-white/50 rounded-lg p-3 text-sm border-l-4 border-blue-500">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-forest-bark">To fix this issue:</p>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Click the button below to log out completely</li>
                  <li>Sign in again with your Google account</li>
                  <li>When prompted, make sure to check "Allow" for all requested permissions</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <Button 
              onClick={handleLogout}
              variant="destructive"
              className="flex items-center gap-2"
            >
              Log out and try again
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
