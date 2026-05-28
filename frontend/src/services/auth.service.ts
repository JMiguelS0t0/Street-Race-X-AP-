import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  foto_perfil?: string | null;
  zona_localidad?: string | null;
  zona_ciudad?: string | null;
  zona_estado?: string | null;
  zona_pais?: string | null;
  rango?: string | null;
  categoria_id?: string | null;
  victorias?: number | null;
  derrotas?: number | null;
  retos_consecutivos?: number | null;
  estado?: string | null;
  rol?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginParams {
  email: string;
  password_hash?: string; 
  password?: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password?: string;
  foto_perfil?: string;
  zona_localidad?: string;
  zona_ciudad?: string;
  zona_estado?: string;
  zona_pais?: string;
}

export const login = async (params: LoginParams): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', {
    email: params.email,
    password: params.password,
  });
  return response.data;
};

export const register = async (params: RegisterParams): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', {
    username: params.username,
    email: params.email,
    password: params.password,
    foto_perfil: params.foto_perfil,
    zona_localidad: params.zona_localidad || '',
    zona_ciudad: params.zona_ciudad || '',
    zona_estado: params.zona_estado || '',
    zona_pais: params.zona_pais || '',
  });
  return response.data;
};

export const getMe = async (): Promise<{ success: boolean; data: User }> => {
  const response = await api.get<{ success: boolean; data: User }>('/auth/me');
  return response.data;
};
