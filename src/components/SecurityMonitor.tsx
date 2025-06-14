
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TokenSecurity from '@/utils/security';

interface SecurityEvent {
  timestamp: string;
  event: string;
  details?: any;
  userAgent: string;
  url: string;
}

export const SecurityMonitor = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);

  useEffect(() => {
    // Check for security events on mount
    const events = JSON.parse(localStorage.getItem('security_events') || '[]');
    setSecurityEvents(events);
    
    // Check for suspicious activity
    const isSuspicious = TokenSecurity.detectSuspiciousActivity();
    setSuspiciousActivity(isSuspicious);
    setShowAlert(isSuspicious);
    
    // Set up periodic security checks
    const interval = setInterval(() => {
      const currentEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
      setSecurityEvents(currentEvents);
      
      const currentSuspicious = TokenSecurity.detectSuspiciousActivity();
      if (currentSuspicious && !suspiciousActivity) {
        setSuspiciousActivity(true);
        setShowAlert(true);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [suspiciousActivity]);

  const clearSecurityEvents = () => {
    localStorage.removeItem('security_events');
    setSecurityEvents([]);
    setSuspiciousActivity(false);
    setShowAlert(false);
  };

  const handleLogout = () => {
    TokenSecurity.clearAllTokens();
    clearSecurityEvents();
    window.location.reload();
  };

  if (!showAlert && !import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      {showAlert && suspiciousActivity && (
        <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 dark:text-red-400">
            Suspicious Activity Detected
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            <p className="mb-3">
              Multiple security events have been detected. This could indicate:
            </p>
            <ul className="list-disc ml-4 mb-3 space-y-1">
              <li>Someone trying to access your account</li>
              <li>Corrupted authentication tokens</li>
              <li>Browser security issues</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                Secure Logout
              </Button>
              <Button 
                onClick={() => setShowAlert(false)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {import.meta.env.DEV && securityEvents.length > 0 && (
        <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <Shield className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-400">
            Security Events (Development Mode)
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">Recent security events:</p>
            <div className="max-h-32 overflow-y-auto text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border">
              {securityEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  {' '}
                  <span className="text-red-600 dark:text-red-400">
                    {event.event}
                  </span>
                  {event.details && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {' '}({JSON.stringify(event.details)})
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Button 
              onClick={clearSecurityEvents}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Clear Events
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
