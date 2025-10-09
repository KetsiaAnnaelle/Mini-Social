import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/utils/axiosInstance';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FaChalkboardTeacher, 
  FaFileAlt, 
  FaComments, 
  FaUsers, 
  FaUserPlus,
  FaCheck,
  FaTimes,
  FaPaperPlane
} from 'react-icons/fa';
import SidebarJob from '@/composant/SidebarJob';
import Swal from 'sweetalert2';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchEmail, setSearchEmail] = useState('');
  const [showSendRequest, setShowSendRequest] = useState(false);
  const queryClient = useQueryClient();

  // Fetch dashboard data based on user role
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', user && (user as any)?.id],
    queryFn: async () => {
      //const response = await axios.get('/api/dashboard');
      const response = await axios.get('/dashboard');
      return response.data;
    },
    enabled: !!(user && (user as any)?.id),
  });

  // Fetch friend requests
  const { data: friendRequests } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      //const response = await axios.get('/api/friend-requests');
      const response = await axios.get('/friend-requests');
      return response.data;
    },
    enabled: !!(user && (user as any)?.id),
  });

  // Fetch friends list
  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      //const response = await axios.get('/api/friends');
      const response = await axios.get('/friends');
      return response.data;
    },
    enabled: !!(user && (user as any)?.id),
  });

  // Mutations for friend requests
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      //const response = await axios.post(`/api/friend-request/accept/${requestId}`);
      const response = await axios.post(`/friend-request/accept/${requestId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      Swal.fire('Succès!', 'Demande d\'ami acceptée.', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Erreur!', error.response?.data?.message || 'Erreur lors de l\'acceptation.', 'error');
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      //const response = await axios.post(`/api/friend-request/reject/${requestId}`);
      const response = await axios.post(`/friend-request/reject/${requestId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      Swal.fire('Succès!', 'Demande d\'ami rejetée.', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Erreur!', error.response?.data?.message || 'Erreur lors du rejet.', 'error');
    }
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (receiverId: number) => {
      //const response = await axios.post('/api/friend-request/send', { receiver_id: receiverId });
      const response = await axios.post('/friend-request/send', { receiver_id: receiverId });
      return response.data;
    },
    onSuccess: () => {
      setSearchEmail('');
      setShowSendRequest(false);
      Swal.fire('Succès!', 'Demande d\'ami envoyée.', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Erreur!', error.response?.data?.message || 'Erreur lors de l\'envoi.', 'error');
    }
  });

  // Search user by email
  const searchUserMutation = useMutation({
    mutationFn: async (email: string) => {
      //const response = await axios.get(`/api/users/search?email=${email}`);
      const response = await axios.get(`/users/search?email=${email}`);
      return response.data;
    },
    onError: () => {
      Swal.fire('Erreur!', 'Utilisateur non trouvé.', 'error');
    }
  });

  const handleAcceptRequest = (requestId: number) => {
    acceptRequestMutation.mutate(requestId);
  };

  const handleRejectRequest = (requestId: number) => {
    rejectRequestMutation.mutate(requestId);
  };

  const handleSendRequest = async () => {
    if (!searchEmail.trim()) {
      Swal.fire('Erreur!', 'Veuillez entrer un email.', 'error');
      return;
    }

    try {
      const userData = await searchUserMutation.mutateAsync(searchEmail);
      if (userData.id === (user as any)?.id) {
        Swal.fire('Erreur!', 'Vous ne pouvez pas vous envoyer une demande d\'ami.', 'error');
        return;
      }
      
      sendRequestMutation.mutate(userData.id);
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <SidebarJob />
        <main className="flex-1 md:ml-80">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Sidebar: hidden on mobile, shown on md+ */}
      <div className="md:block hidden">
        <SidebarJob />
      </div>
      {/* Mobile Sidebar: show only on mobile */}
      <div className="md:hidden block">
        <SidebarJob />
      </div>
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-8 md:py-10">
          {/* Header */}
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-2">Dashboard</h1>
            <p className="text-base sm:text-lg text-gray-500">Bienvenue, {user?.name} ! Voici un aperçu de vos activités.</p>
          </div>

          {/* Stats Cards */}
          <section className="mb-6 sm:mb-10">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {isStudent && (
                <>
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[8rem] flex flex-col justify-between hover:shadow-xl transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Candidatures</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData?.applications?.total || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaFileAlt className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[8rem] flex flex-col justify-between hover:shadow-xl transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Messages</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData?.messages?.total || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FaComments className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[8rem] flex flex-col justify-between hover:shadow-xl transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Amis</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {friends?.length || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaUsers className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[8rem] flex flex-col justify-between hover:shadow-xl transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Demandes d'amis</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {friendRequests?.pending?.length || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FaUserPlus className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {isTeacher && (
                <>
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[8rem] flex flex-col justify-between hover:shadow-xl transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Candidatures reçues</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData?.applications?.total || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaFileAlt className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[8rem] flex flex-col justify-between hover:shadow-xl transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Offres partagées</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData?.sharedOffers?.total || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FaChalkboardTeacher className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[8rem] flex flex-col justify-between hover:shadow-xl transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Messages envoyés</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData?.messages?.sent || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaComments className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[8rem] flex flex-col justify-between hover:shadow-xl transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Messages reçus</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData?.messages?.received || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FaComments className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <hr className="my-10 border-gray-200" />

          {/* Tabs and Content */}
          <section className="bg-white rounded-2xl shadow-lg p-2 sm:p-6 overflow-x-auto">
            {/* Tabs */}
            <div className="mb-4 sm:mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-8 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Vue d'ensemble
                  </button>
                  {isStudent && (
                    <button
                      onClick={() => setActiveTab('applications')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'applications'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Mes Candidatures
                    </button>
                  )}
                  {isStudent && (
                    <button
                      onClick={() => setActiveTab('friends')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'friends'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Amis
                    </button>
                  )}
                  {isTeacher && (
                    <button
                      onClick={() => setActiveTab('applications')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'applications'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Candidatures recues
                    </button>
                  )}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-8">
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                  {isStudent && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Candidatures par mois
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={dashboardData?.applications?.byMonth || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Messages par jour
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={dashboardData?.messages?.byDay || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="sent" stroke="#10B981" />
                            <Line type="monotone" dataKey="received" stroke="#F59E0B" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}

                  {isTeacher && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Candidatures par filiere
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={dashboardData?.applications?.byField || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {dashboardData?.applications?.byField?.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Candidatures par mois
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={dashboardData?.applications?.byMonth || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isStudent ? 'Mes Candidatures' : 'Candidatures recues'}
                </h3>
                <div className="space-y-4">
                  {dashboardData?.applications?.list?.map((application: any) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {application.job_offer?.title || 'Offre supprimee'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {isStudent ? application.job_offer?.company : application.user?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Postule le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          application.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : application.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {application.status === 'pending' ? 'En attente' : 
                           application.status === 'accepted' ? 'Acceptee' : 'Refusee'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!dashboardData?.applications?.list || dashboardData.applications.list.length === 0) && (
                    <p className="text-gray-500 text-center py-8">
                      {isStudent ? 'Aucune candidature pour le moment.' : 'Aucune candidature recue.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'friends' && isStudent && (
              <div className="space-y-6">
                {/* Send Friend Request */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Envoyer une demande d'ami
                    </h3>
                    <button
                      onClick={() => setShowSendRequest(!showSendRequest)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      <span>Nouvelle demande</span>
                    </button>
                  </div>
                  
                  {showSendRequest && (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex space-x-3">
                        <input
                          type="email"
                          placeholder="Email de l'utilisateur"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                          onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                        />
                        <button
                          onClick={handleSendRequest}
                          disabled={sendRequestMutation.isPending}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <FaPaperPlane className="w-4 h-4" />
                          <span>{sendRequestMutation.isPending ? 'Envoi...' : 'Envoyer'}</span>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Entrez l'email de l'étudiant à qui vous voulez envoyer une demande d'ami.
                      </p>
                    </div>
                  )}
                </div>

                {/* Friend Requests */}
                {friendRequests?.pending && friendRequests.pending.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Demandes d'amis en attente
                    </h3>
                    <div className="space-y-3">
                      {friendRequests.pending.map((request: any) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {request.sender?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.sender?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {request.sender?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={acceptRequestMutation.isPending}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={rejectRequestMutation.isPending}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Friends List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Mes amis ({friends?.length || 0})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends?.map((friend: any) => (
                      <div key={friend.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {friend.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {friend.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {friend.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!friends || friends.length === 0) && (
                    <p className="text-gray-500 text-center py-8">
                      Vous n'avez pas encore d'amis. Commencez à vous connecter avec d'autres étudiants !
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
 