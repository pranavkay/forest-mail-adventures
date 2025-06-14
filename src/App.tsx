
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from "./context/UserContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";

// Get Google Client ID from environment variable with fallback
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "541980333383-47b9k63tve1lfobs9pkltv245gf9ddp5.apps.googleusercontent.com";

// Validate that we have a client ID
if (!GOOGLE_CLIENT_ID) {
  console.error('Missing Google Client ID. Please set VITE_GOOGLE_CLIENT_ID environment variable.');
}

// Protected route component with improved token verification
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check for token in localStorage
  const token = localStorage.getItem('gmail_token');
  const accessToken = localStorage.getItem('gmail_access_token');
  
  const isAuthenticated = token !== null || accessToken !== null;
  
  if (!isAuthenticated) {
    // Don't log sensitive information in production
    if (import.meta.env.DEV) {
      console.log('Not authenticated, redirecting to login');
    }
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Only log origin in development
  if (import.meta.env.DEV) {
    console.log('Current origin (add this to Google OAuth Redirect URIs):', window.location.origin);
  }
  
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <TooltipProvider>
          <UserProvider>
            <div className="min-h-screen w-full">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/contacts" element={
                  <ProtectedRoute>
                    <Contacts />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </UserProvider>
        </TooltipProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
};

export default App;
