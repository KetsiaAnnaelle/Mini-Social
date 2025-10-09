import { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaEnvelope, FaUser, FaBriefcase } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/utils/axiosInstance';
import echo from '@/lib/echo';

interface Notification {
  id: number;
  type: 'message' | 'job_offer' | 'application' | 'friend_request';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

const fetchUnreadCount = async (): Promise<{ count: number }> => {
  try {
    //const response = await axios.get('/api/notifications/unread-count');
    const response = await axios.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { count: 0 };
  }
};

const markAsRead = async (id: number): Promise<{ message: string }> => {
  //const response = await axios.patch(`/api/notifications/${id}/read`);
  const response = await axios.patch(`/notifications/${id}/read`);
  return response.data;
};

const markAllAsRead = async (): Promise<{ message: string }> => {
  //const response = await axios.patch('/api/notifications/mark-all-read');
  const response = await axios.patch('/notifications/mark-all-read');
  return response.data;
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { updateUnreadCount } = useNotificationStore();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCountLocal, setUnreadCountLocal] = useState(0);

  // Fetch unread count
  const unreadCountQuery = useQuery<{ count: number }, Error>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    enabled: !!user,
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Listen for real-time notifications
  useEffect(() => {
    if (user && (user as any).id && echo) {
      const channel = echo.private(`notifications.${(user as any).id}`);
      
      channel.listen('.new.notification', () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      });

      return () => {
        channel.stopListening('.new.notification');
      };
    }
  }, [user, queryClient]);

  useEffect(() => {
    if (user) {
      // Fetch real notifications
      const fetchNotifications = async () => {
        try {
          //const response = await axios.get('/api/notifications');
          const response = await axios.get('/notifications');
          const notifications = response.data.notifications || [];
          setNotifications(notifications);
          setUnreadCountLocal(notifications.filter((n: Notification) => !n.read).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      const fetchUnreadCount = async () => {
        try {
          //const response = await axios.get('/api/notifications/unread-count');
          const response = await axios.get('/notifications/unread-count');
          setUnreadCountLocal(response.data.count || 0);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (unreadCountQuery.data) {
      updateUnreadCount(unreadCountQuery.data.count);
    }
  }, [unreadCountQuery.data, updateUnreadCount]);

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FaEnvelope className="text-blue-500" />;
      case 'job_offer':
        return <FaBriefcase className="text-green-500" />;
      case 'application':
        return <FaUser className="text-purple-500" />;
      default:
        return <FaBell className="text-gray-500" />;
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

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
      >
        <FaBell className="w-6 h-6" />
        {unreadCountLocal > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCountLocal > 9 ? '9+' : unreadCountLocal}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 mx-auto w-full max-w-xs sm:absolute sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-w-none bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCountLocal > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Tout marquer comme lu
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto overflow-x-auto">
            {notifications.length === 0 ? (
              <div className="p-4 sm:p-6 text-center text-gray-500">
                <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs sm:text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 sm:p-3 border-t border-gray-100">
            <button className="w-full text-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium">
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;