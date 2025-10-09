import { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion } from "framer-motion";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaGraduationCap, 
  FaChalkboardTeacher,
  FaUserGraduate
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

// ✅ Schéma de validation avec le nom attendu par Laravel
const schema = yup.object().shape({
  name: yup.string().required("Nom complet requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup.string().min(6, "Mot de passe trop court").required("Mot de passe requis"),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password'), undefined], 'Les mots de passe doivent correspondre')
    .required("Confirmation du mot de passe requise"),
  role: yup.string().required("Role requis"),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      Swal.fire({
        title: 'Inscription...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      //const response = await axios.post('http://localhost:8000/api/auth/register', data);
      const response = await axios.post(`${import.meta.env.VITE_API_BACKEND_URL}/auth/register`, data);

      // ✅ Ici on récupère le token et le user
      const { token, user } = response.data;

      // ✅ Ici on enregistre dans le Zustand
      const { setToken, setUser } = useAuthStore.getState();
      setToken(token);
      setUser(user);

      Swal.fire({
        icon: 'success',
        title: 'Inscription réussie',
        text: response.data.message || 'Votre compte a été créé avec succès !',
      });

      reset(); 
      navigate('/login');

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
          text: error.response?.data?.message || 'Une erreur est survenue.',
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
        className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Left Side - Image */}
        <div className="relative h-64 lg:h-auto bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 text-center text-white p-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <FaGraduationCap className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Rejoignez MiniSocial</h2>
            <p className="text-lg text-purple-100 mb-6">
              Créez votre compte et accédez à notre réseau social académique
            </p>
            <div className="space-y-3 text-sm text-purple-100">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Créez votre profil professionnel</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Découvrez des opportunités</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Connectez-vous avec la communauté</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Créer un compte
              </h1>
              <p className="text-gray-600">
                Rejoignez notre communauté académique
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Votre nom complet"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password_confirmation")}
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Confirmez votre mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange('student');
                          setSelectedRole('student');
                        }}
                        className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                          selectedRole === 'student'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <FaUserGraduate className="w-6 h-6 mx-auto mb-2 text-purple-700" />
                        <span className="font-medium  text-purple-700">Étudiant</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange('teacher');
                          setSelectedRole('teacher');
                        }}
                        className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                          selectedRole === 'teacher'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <FaChalkboardTeacher className="w-6 h-6 mx-auto mb-2  text-purple-700" />
                        <span className="font-medium  text-purple-700">Enseignant</span>
                      </button>
                    </div>
                  )}
                />
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                Créer mon compte
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Déjà un compte ?{' '}
                <Link 
                  to="/login" 
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                En créant un compte, vous acceptez nos{' '}
                <a href="#" className="text-purple-600 hover:underline">conditions d'utilisation</a>
                {' '}et notre{' '}
                <a href="#" className="text-purple-600 hover:underline">politique de confidentialité</a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
