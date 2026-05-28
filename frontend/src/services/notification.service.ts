import api from './api';

export interface Notification {
  id: string;
  user_id: string;
  tipo: string | null;
  mensaje: string | null;
  leida: boolean;
  referencia_id: string | null;
  created_at: string | null;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  error?: string;
}

export interface NotificationUpdateResponse {
  success: boolean;
  data?: Notification;
  error?: string;
}

export const listNotifications = async (): Promise<NotificationListResponse> => {
  const response = await api.get<NotificationListResponse>('/notifications');
  return response.data;
};

export const updateNotification = async (id: string, leida: boolean): Promise<NotificationUpdateResponse> => {
  const response = await api.patch<NotificationUpdateResponse>(`/notifications/${id}`, { leida });
  return response.data;
};

export const bulkUpdateNotifications = async (leida: boolean): Promise<{ success: boolean; message?: string; error?: string }> => {
  const response = await api.patch<{ success: boolean; message?: string; error?: string }>('/notifications', { leida });
  return response.data;
};

export const deleteNotification = async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  const response = await api.delete<{ success: boolean; message?: string; error?: string }>(`/notifications/${id}`);
  return response.data;
};
