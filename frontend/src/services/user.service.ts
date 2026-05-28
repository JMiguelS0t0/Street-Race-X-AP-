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
