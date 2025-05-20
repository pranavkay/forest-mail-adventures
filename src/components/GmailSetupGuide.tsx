
import { useUser } from '@/context/UserContext';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, CheckCircle, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const GmailSetupGuide = () => {
  const { clearAuthAndLogout } = useUser();
  
  const handleLogout = () => {
    // Use the new function that handles token revocation
    clearAuthAndLogout();
  };
  
  return (
    <Alert className="mb-6 border-forest-berry/40 bg-forest-berry/5">
      <AlertTitle className="flex items-center text-lg font-semibold text-forest-berry">
        <AlertTriangle className="mr-2 h-5 w-5" /> 
        Gmail Permissions Required
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-3 py-2">
          <p>
            Forest Mail needs specific permissions to access your Gmail. Our login process needs to request these permissions explicitly.
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
                  <li>When prompted to sign in, choose your Google account</li>
                  <li>Google will show a permissions screen - you <strong>must</strong> approve both permissions</li>
                  <li>If no permissions screen appears, you may need to revoke permissions in your Google Account settings first</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-3">
            <Button 
              onClick={handleLogout}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log out and try again
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open('https://myaccount.google.com/permissions', '_blank')}
            >
              Manage Google Permissions
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
