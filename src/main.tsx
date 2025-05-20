
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/context/UserContext';
import App from './App.tsx'
import Index from './pages/Index';
import Login from './pages/Login';
import Contacts from './pages/Contacts';
import NotFound from './pages/NotFound';
import './index.css'

// Create a client for React Query
const queryClient = new QueryClient();

// Render the app
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Index />} />
            <Route path="login" element={<Login />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
