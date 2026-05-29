import api from './api';

export interface ActiveVehicle {
  id: string;
  tipo_vehiculo: string;
  marca: string | null;
  modelo: string | null;
  foto: string | null;
}

export interface Pilot {
  id: string;
  username: string;
  foto_perfil: string | null;
  rango: string;
  zona_ciudad: string | null;
  zona_estado: string | null;
  vehicles: ActiveVehicle[];
}

export interface DiscoverResponse {
  success: boolean;
  data: {
    pilots: Pilot[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const discoverPilots = async (params: {
  ciudad?: string;
  tipo_vehiculo?: string;
  page?: number;
  limit?: number;
}): Promise<DiscoverResponse> => {
  const response = await api.get<DiscoverResponse>('/users/discover', { params });
  return response.data;
};
