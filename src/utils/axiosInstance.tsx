import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

//VITE_API_BACKEND_URL=https://ketsia.foichretienne.org/api
//VITE_API_BACKEND_FILE=https://foichretienne.org/ketsia/storage/app/public/
const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8000',
   baseURL: `${import.meta.env.VITE_API_BACKEND_URL}`,
});

// On injecte le token à chaque requête automatiquement
axiosInstance.interceptors.request.use(
  (config) => {
   const { token } = useAuthStore.getState(); // très important : on utilise .getState()
   //const { user } = useAuthStore.getState(); // très important : on utilise .getState()
   //const { user } = useAuthStore.getState();
     console.log("TOKEN:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
