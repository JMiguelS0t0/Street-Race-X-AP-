import api from './api';

export interface ChallengeCreateParams {
  retado_id: string;
  tipo_carrera: string;
  ubicacion_acordada: string;
  fecha_acordada?: string | null;
  notas?: string;
}

export interface Challenge {
  id: string;
  retador_id: string;
  retado_id: string;
  vehiculo_retador_id: string;
  vehiculo_retado_id: string;
  tipo_carrera: string | null;
  estado: string | null;
  ubicacion_acordada: string | null;
  fecha_acordada: string | null;
  notas: string | null;
  ganador_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  retador?: { username: string; rango: string };
  retado?: { username: string; rango: string };
  vehiculo_retador?: { marca: string; modelo: string };
  vehiculo_retado?: { marca: string; modelo: string };
}

export interface ChallengeResponse {
  success: boolean;
  message?: string;
  data?: Challenge;
  error?: string;
}

export interface ChallengeListResponse {
  success: boolean;
  data: {
    challenges: Challenge[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface GlobalHistoryResponse {
  success: boolean;
  data: {
    id: string;
    retador_id: string;
    retado_id: string;
    tipo_carrera: string;
    estado: string;
    ganador_id: string | null;
    updated_at: string;
    retador: { username: string; rango: string };
    retado: { username: string; rango: string };
    ganador: { username: string } | null;
  }[];
  error?: string;
}

export const createChallenge = async (data: ChallengeCreateParams): Promise<ChallengeResponse> => {
  const response = await api.post<ChallengeResponse>('/challenges', data);
  return response.data;
};

export const listChallenges = async (params?: { page?: number; limit?: number; estado?: string; tipo_carrera?: string }): Promise<ChallengeListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.estado) queryParams.append('estado', params.estado);
  if (params?.tipo_carrera) queryParams.append('tipo_carrera', params.tipo_carrera);

  const response = await api.get<ChallengeListResponse>(`/challenges?${queryParams.toString()}`);
  return response.data;
};

export const updateChallenge = async (id: string, data: { estado: string; ganador_id?: string }): Promise<ChallengeResponse> => {
  const response = await api.patch<ChallengeResponse>(`/challenges/${id}`, data);
  return response.data;
};

export const getGlobalHistory = async (): Promise<GlobalHistoryResponse> => {
  const response = await api.get<GlobalHistoryResponse>('/challenges/history');
  return response.data;
};

export interface ChallengeAdmin extends Challenge {
  retador: { id: string; username: string; rango: string };
  retado: { id: string; username: string; rango: string };
  vehiculo_retador: { id: string; marca: string; modelo: string };
  vehiculo_retado: { id: string; marca: string; modelo: string };
}

export interface ListChallengesAdminResponse {
  success: boolean;
  data: {
    challenges: ChallengeAdmin[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface AdminDeleteChallengeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const adminListAllChallenges = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<ListChallengesAdminResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (search) queryParams.append('search', search);

  const response = await api.get<ListChallengesAdminResponse>(
    `/challenges/admin/all?${queryParams.toString()}`
  );
  return response.data;
};

export const adminDeleteChallenge = async (id: string): Promise<AdminDeleteChallengeResponse> => {
  const response = await api.delete<AdminDeleteChallengeResponse>(`/challenges/admin/${id}`);
  return response.data;
};
