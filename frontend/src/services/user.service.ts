import api from './api';

export interface ProfileUpdateParams {
  foto_perfil?: string;
  zona_localidad?: string;
  zona_ciudad?: string;
  zona_estado?: string;
  zona_pais?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    username: string;
    email: string;
    foto_perfil: string | null;
    zona_ciudad: string | null;
  };
  error?: string;
}

export const updateProfile = async (data: ProfileUpdateParams): Promise<ProfileUpdateResponse> => {
  const response = await api.patch<ProfileUpdateResponse>('/users/me', data);
  return response.data;
};

export interface RankingUser {
  id: string;
  username: string;
  foto_perfil: string | null;
  rango: string;
  victorias: number;
  derrotas: number;
}

export interface RankingResponse {
  success: boolean;
  data: RankingUser[];
  error?: string;
}

export const getTopRanking = async (limit?: number): Promise<RankingResponse> => {
  const response = await api.get<RankingResponse>(`/users/ranking${limit ? `?limit=${limit}` : ''}`);
  return response.data;
};

export interface UserAdmin {
  id: string;
  username: string;
  email: string;
  rango: string | null;
  estado: string | null;
  rol: string | null;
  created_at: string | null;
}

export interface ListUsersResponse {
  success: boolean;
  data: {
    users: UserAdmin[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface AdminUpdateUserParams {
  estado?: string;
  rol?: string;
  rango?: string;
}

export interface AdminUpdateUserResponse {
  success: boolean;
  data?: UserAdmin;
  message?: string;
  error?: string;
}

export interface AdminDeleteUserResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const listAllUsers = async (page: number = 1, limit: number = 10): Promise<ListUsersResponse> => {
  const response = await api.get<ListUsersResponse>(`/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const adminUpdateUser = async (id: string, data: AdminUpdateUserParams): Promise<AdminUpdateUserResponse> => {
  const response = await api.patch<AdminUpdateUserResponse>(`/users/${id}`, data);
  return response.data;
};

export const adminDeleteUser = async (id: string): Promise<AdminDeleteUserResponse> => {
  const response = await api.delete<AdminDeleteUserResponse>(`/users/${id}`);
  return response.data;
};
