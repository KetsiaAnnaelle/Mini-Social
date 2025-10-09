import { FaBell, FaEnvelope, FaUser, FaBriefcase, FaCheck, FaTrash, FaFilter } from 'react-icons/fa';
import axios from '@/utils/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SidebarJob from '@/composant/SidebarJob';
import Swal from 'sweetalert2';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: number;
  type: 'message' | 'job_offer' | 'application' | 'friend_request';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    //const response = await axios.get('/api/notifications');
    const response = await axios.get('/notifications');
    return response.data.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

const markNotificationAsRead = async (id: number) => {
  try {
    //await axios.patch(`/api/notifications/${id}/read`);
    await axios.patch(`/notifications/${id}/read`);
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
};

const deleteNotification = async (id: number) => {
  try {
    //await axios.delete(`/api/notifications/${id}`);
    await axios.delete(`/notifications/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false };
  }
};

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) || 
      (filter === 'read' && notification.read);
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesFilter && matchesType;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FaEnvelope className="text-blue-500" />;
      case 'job_offer':
        return <FaBriefcase className="text-green-500" />;
      case 'application':
        return <FaUser className="text-purple-500" />;
      case 'friend_request':
        return <FaUser className="text-orange-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'border-l-blue-500 bg-blue-50';
      case 'job_offer':
        return 'border-l-green-500 bg-green-50';
      case 'application':
        return 'border-l-purple-500 bg-purple-50';
      case 'friend_request':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleDelete = async (notification: Notification) => {
    const result = await Swal.fire({
      title: 'Supprimer cette notification ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(notification.id);
    }
  };

  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter((n: Notification) => !n.read);
    unreadNotifications.forEach((notification: Notification) => {
      markAsReadMutation.mutate(notification.id);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex">
      {/* Hamburger menu for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-xl p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 h-screen w-4/5 max-w-xs bg-white border-r border-gray-200 shadow-2xl z-50 transition-transform duration-300 ease-in-out md:hidden">
            <button
              className="absolute top-4 right-4 z-50 bg-white rounded-xl p-2 shadow border border-gray-200 hover:shadow-xl transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
            <SidebarJob />
          </div>
        </>
      )}
      {/* Static sidebar for desktop */}
      <div className="hidden md:block">
        <SidebarJob />
      </div>
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-8 md:py-10">
          {/* Header */}
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-2">Notifications</h1>
            <p className="text-base sm:text-lg text-gray-500">
              {unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-2 sm:mt-4 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <FaCheck className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Filters */}
          <section className="mb-6 sm:mb-10">
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Filtres :</span>
                </div>
                {/* Status Filter */}
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      filter === 'all' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Toutes ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      filter === 'unread' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Non lues ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilter('read')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      filter === 'read' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Lues ({notifications.length - unreadCount})
                  </button>
                </div>
                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="message">Messages</option>
                  <option value="job_offer">Offres d'emploi</option>
                  <option value="application">Candidatures</option>
                  <option value="friend_request">Demandes d'ami</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications List */}
          <section>
            <div className="space-y-3 sm:space-y-4">
              {isLoading ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm sm:text-base">Chargement des notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
                  <FaBell className="w-10 h-10 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2">
                    Aucune notification
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {filter === 'all' 
                      ? "Vous n'avez pas encore de notifications." 
                      : `Aucune notification ${filter === 'unread' ? 'non lue' : 'lue'} trouvée.`
                    }
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-2xl shadow-lg border-l-4 p-3 sm:p-6 transition-all duration-200 hover:shadow-xl flex flex-col ${
                      getNotificationColor(notification.type)
                    } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex items-start gap-2 sm:gap-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 sm:mb-2 gap-1 sm:gap-0">
                            <h3 className={`text-sm sm:text-lg font-semibold ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-base text-gray-600 mb-2 sm:mb-3">
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs sm:text-sm text-blue-600 font-medium">Non lue</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 ml-0 sm:ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                            title="Marquer comme lu"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Supprimer"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Notifications; 