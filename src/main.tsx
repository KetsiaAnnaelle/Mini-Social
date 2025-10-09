
//import { createRoot } from 'react-dom/client'
//import App from './App.tsx'

//createRoot(document.getElementById('root')!).render(
  //  <StrictMode>
    //<App />
    // </StrictMode>,
    
    
    //)
    
    
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider'; // adapte le chemin selon ton projet
//export const USER = createContext();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
