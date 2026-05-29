import api from './api';
import type { Challenge } from './challenge.service';
import type { Vehicle } from './vehicle.service';

// --- USERS ---
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

export const adminListAllUsers = async (page: number = 1, limit: number = 10): Promise<ListUsersResponse> => {
  const response = await api.get<ListUsersResponse>(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const adminUpdateUser = async (id: string, data: AdminUpdateUserParams): Promise<AdminUpdateUserResponse> => {
  const response = await api.patch<AdminUpdateUserResponse>(`/admin/users/${id}`, data);
  return response.data;
};

export const adminDeleteUser = async (id: string): Promise<AdminDeleteUserResponse> => {
  const response = await api.delete<AdminDeleteUserResponse>(`/admin/users/${id}`);
  return response.data;
};

// --- CHALLENGES ---
export interface ChallengeAdmin extends Challenge {
  retador?: { id: string; username: string; rango: string } | null;
  retado?: { id: string; username: string; rango: string } | null;
  vehiculo_retador?: { id: string; marca: string; modelo: string } | null;
  vehiculo_retado?: { id: string; marca: string; modelo: string } | null;
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

export interface AdminUpdateChallengeResponse {
  success: boolean;
  message?: string;
  data?: Challenge;
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
    `/admin/challenges?${queryParams.toString()}`
  );
  return response.data;
};

export const adminDeleteChallenge = async (id: string): Promise<AdminDeleteChallengeResponse> => {
  const response = await api.delete<AdminDeleteChallengeResponse>(`/admin/challenges/${id}`);
  return response.data;
};

export const adminUpdateChallenge = async (
  id: string,
  data: {
    tipo_carrera?: string;
    numero_vueltas?: number | null;
    location_id?: string | null;
    fecha_acordada?: string | null;
    notas?: string;
    estado?: string;
    ganador_id?: string | null;
    ganador_retador_id?: string | null;
    ganador_retado_id?: string | null;
  }
): Promise<AdminUpdateChallengeResponse> => {
  const response = await api.patch<AdminUpdateChallengeResponse>(`/admin/challenges/${id}`, data);
  return response.data;
};

// --- VEHICLES ---
export interface VehicleAdmin extends Vehicle {
  user: {
    id: string;
    username: string;
  };
}

export interface ListVehiclesAdminResponse {
  success: boolean;
  data: {
    vehicles: VehicleAdmin[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface AdminDeleteVehicleResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const adminListAllVehicles = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<ListVehiclesAdminResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (search) queryParams.append('search', search);

  const response = await api.get<ListVehiclesAdminResponse>(
    `/admin/vehicles?${queryParams.toString()}`
  );
  return response.data;
};

export const adminDeleteVehicle = async (id: string): Promise<AdminDeleteVehicleResponse> => {
  const response = await api.delete<AdminDeleteVehicleResponse>(`/admin/vehicles/${id}`);
  return response.data;
};
