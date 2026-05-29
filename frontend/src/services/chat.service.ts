import api from './api';

export interface ChatMember {
  id: string;
  chat_room_id: string;
  user_id: string;
  created_at: string | null;
  user: {
    id: string;
    username: string;
    foto_perfil: string | null;
    rango: string | null;
  };
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  contenido: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    foto_perfil: string | null;
    rango: string | null;
  };
}

export interface ChatRoom {
  id: string;
  nombre: string | null;
  is_grupo: boolean;
  created_at: string | null;
  updated_at: string | null;
  members: ChatMember[];
  messages: ChatMessage[];
}

export interface ChatRoomResponse {
  success: boolean;
  data: ChatRoom[];
  error?: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    messages: ChatMessage[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface CreateRoomResponse {
  success: boolean;
  data: ChatRoom;
  message?: string;
  error?: string;
}

export const getRooms = async (): Promise<ChatRoomResponse> => {
  const response = await api.get<ChatRoomResponse>('/chat/rooms');
  return response.data;
};

export const getChatHistory = async (roomId: string, params?: { page?: number; limit?: number }): Promise<ChatHistoryResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await api.get<ChatHistoryResponse>(`/chat/rooms/${roomId}/messages?${queryParams.toString()}`);
  return response.data;
};

export const createRoom = async (params: {
  is_grupo: boolean;
  nombre?: string;
  recipientId?: string;
  userIds?: string[];
}): Promise<CreateRoomResponse> => {
  const response = await api.post<CreateRoomResponse>('/chat/rooms', params);
  return response.data;
};
