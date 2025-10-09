import { useState } from 'react';
import { 
  LayoutDashboard, 
  Menu, 
  X, 
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Bell,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import axios from '@/utils/axiosInstance';

// Fetch functions
const fetchStudentCount = async () => {
  //const response = await axios.get('/api/users?role=student');
  const response = await axios.get('/users?role=student');
  return response.data.length;
};
const fetchJobOffersCount = async () => {
  //const response = await axios.get('/api/job-offers');
  const response = await axios.get('/job-offers');
  return response.data.length;
};

function SidebarJob() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const { data: studentCount = 0 } = useQuery({
    queryKey: ['studentCount'],
    queryFn: fetchStudentCount,
  });
  const { data: jobOffersCount = 0 } = useQuery({
    queryKey: ['jobOffersCount'],
    queryFn: fetchJobOffersCount,
  });

  const navItems = [
    { 
      href: '/', 
      label: 'Accueil', 
      icon: Home,
      description: 'Tableau de bord principal'
    },
    { 
      href: '/offers', 
      label: 'Offres d\'emploi', 
      icon: Briefcase,
      description: 'Gérer les offres d\'emploi'
    },
    { 
      href: '/chat-offers', 
      label: 'Espace de chat', 
      icon: MessageSquare,
      description: 'Communiquer avec les étudiants'
    },
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard ,
      description: 'Consulter la liste des activites'
    },
    { 
      href: '/profile', 
      label: 'Utilisateurs', 
      icon: Users,
      description: 'Gérer les utilisateurs'
    },
    { 
      href: '/notifications', 
      label: 'Notifications', 
      icon: Bell,
      description: 'Voir les notifications'
    },
    //{ 
    //  href: '/settings', 
     // label: 'Paramètres', 
    //  icon: Settings,
    //  description: 'Configurer votre compte'
   // },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle Button for Small Screens */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-xl p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-4/5 max-w-xs bg-white border-r border-gray-200 shadow-2xl z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 md:w-80 md:max-w-none`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">MS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MiniSocial</h1>
              <p className="text-xs text-gray-600">Administration</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user?.name || 'Utilisateur'}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h2>
            <ul className="space-y-2">
              {navItems.map(({ href, label, icon: Icon, description }) => {
                const isActive = location.pathname === href;
                return (
                  <li key={href}>
                    <NavLink
                      to={href}
                      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <span className="font-medium">{label}</span>
                        <p className={`text-xs ${
                          isActive ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {description}
                        </p>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Statistiques rapides
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{jobOffersCount}</p>
                    <p className="text-xs text-blue-600">Offres actives</p>
                  </div>
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{studentCount}</p>
                    <p className="text-xs text-green-600">Étudiants</p>
                  </div>
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-600" />
            <span className="font-medium">Se déconnecter</span>
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              MiniSocial v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SidebarJob;
