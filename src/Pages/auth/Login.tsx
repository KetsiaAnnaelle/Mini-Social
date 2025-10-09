import { useState } from 'react';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useForm } from 'react-hook-form';

// ✅ Schéma de validation avec le nom attendu par Laravel
const schema = yup.object().shape({
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup.string().min(6, "Mot de passe requis").required("Mot de passe requis"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const onSubmit = async (data: any) => {
    try {
      Swal.fire({
        title: 'Connexion...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      //const response = await axios.post('http://localhost:8000/api/auth/login', data, {
      const response = await axios.post(`${import.meta.env.VITE_API_BACKEND_URL}/auth/login`, data, {
        headers: { 'Accept': 'application/json' },
        timeout: 5000,
      });

      if (!response.data.error) {
        const { token, user } = response.data;

        setToken(token);
        setUser(user);
        console.log(user);
        console.log(token);

        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie',
          timer: 2000,
          showConfirmButton: false
        });
        console.log(response.data);
        
        reset();
        navigate('/');
      }

    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        Swal.fire({
          icon: 'error',
          title: 'Délai dépassé',
          text: 'Le serveur a mis trop de temps à répondre. Veuillez réessayer.'
        });
        return;
      }

      if (error.response?.status === 422 && error.response.data?.errors) {
        const messages = Object.values(error.response.data.errors).flat();
        Swal.fire({
          icon: 'error',
          title: 'Erreur de validation',
          html: messages.map(msg => `<p>${msg}</p>`).join(''),
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.message || 'Une erreur inattendue est survenue.',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Left Side - Image */}
        <div className="relative h-64 lg:h-auto bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 text-center text-white p-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <FaGraduationCap className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">MiniSocial</h2>
            <p className="text-lg text-blue-100 mb-6">
              Connectez-vous à votre réseau social académique
            </p>
            <div className="space-y-3 text-sm text-blue-100">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Étudiants, enseignants et entreprises</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Offres de stage et d'emploi</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Chat en temps réel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                CONNEXION
              </h1>
              <p className="text-gray-600">
                Accédez à votre espace personnel
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                Se connecter
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Pas encore de compte ?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Créer un compte
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                En vous connectant, vous acceptez nos{' '}
                <a href="#" className="text-blue-600 hover:underline">conditions d'utilisation</a>
                {' '}et notre{' '}
                <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;