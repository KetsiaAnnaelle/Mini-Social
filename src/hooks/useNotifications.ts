import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/utils/axiosInstance';
import echo from '@/lib/echo';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const fetchNotifications = async (): Promise<NotificationResponse> => {
  const response = await axios.get('/api/notifications');
  return response.data;
};

const fetchUnreadCount = async (): Promise<{ count: number }> => {
  const response = await axios.get('/api/notifications/unread-count');
  return response.data;
};

const markAsRead = async (id: number): Promise<{ message: string }> => {
  const response = await axios.patch(`/api/notifications/${id}/read`);
  return response.data;
};

const markAllAsRead = async (): Promise<{ message: string }> => {
  const response = await axios.patch('/api/notifications/mark-all-read');
  return response.data;
};

const deleteNotification = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete(`/api/notifications/${id}`);
  return response.data;
};

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
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

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Listen for real-time notifications
  useEffect(() => {
    const authStorage = localStorage.getItem('auth-storage');
    const parsedAuth = JSON.parse(authStorage || '{}');
    const currentUserId = parsedAuth.state?.user?.id;

    if (currentUserId && echo) {
      const channel = echo.private(`notifications.${currentUserId}`);
      
      channel.listen('.new.notification', (event: any) => {
        console.log('[Echo] New notification event received:', event);
        const newNotification: Notification = {
          id: event.id,
          type: event.type,
          title: event.title,
          message: event.message,
          data: event.data,
          read: false,
          created_at: event.created_at,
        };
        
        setNewNotifications(prev => [newNotification, ...prev]);
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      });

      return () => {
        channel.stopListening('.new.notification');
      };
    }
  }, [queryClient]);

  return {
    notifications: notificationsData?.notifications || [],
    pagination: notificationsData?.pagination,
    unreadCount: unreadCountData?.count || 0,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    newNotifications,
    clearNewNotifications: () => setNewNotifications([]),
  };
}; 