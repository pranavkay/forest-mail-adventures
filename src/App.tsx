
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

// Get Google Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Protected route component with improved token verification
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check for token in localStorage
  const token = localStorage.getItem('gmail_token');
  const accessToken = localStorage.getItem('gmail_access_token');
  
  const isAuthenticated = token !== null || accessToken !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Validate that we have a client ID - show error screen if missing
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-800 mb-2">
            The application cannot start without a Google Client ID.
          </p>
          <p className="text-gray-600">
            Please make sure the <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">VITE_GOOGLE_CLIENT_ID</code> environment variable is set correctly.
          </p>
        </div>
      </div>
    );
  }

  // Validate Client ID format for production
  if (!/^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/.test(GOOGLE_CLIENT_ID)) {
    console.error('Invalid Google Client ID format detected');
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
