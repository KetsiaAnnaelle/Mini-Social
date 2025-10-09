import { createContext, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Accueil from './Pages/Accueil';
import Register from './Pages/auth/Register';
import Login from './Pages/auth/Login';
import JobOffer from './Pages/JobOffer';
import ChatOffers from './Pages/ChatOffers';
import Dashboard from './Pages/Dashboard';
import { ThemeProvider } from "@/components/theme-provider"
// import EspacePro from './composant/EspacePro'; // Unused, comment out
import Profile from './Pages/Profile';
import Notifications from './Pages/Notifications';

export const USER = createContext<any>(null);

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [token, settoken] = useState(localStorage.getItem('token'));
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <USER.Provider value={[user, setUser, token, settoken]}>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/offers" element={<JobOffer />} />
            <Route path="/chat-offers" element={<ChatOffers />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </USER.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;