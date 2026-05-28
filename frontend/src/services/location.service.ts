import api from './api';

export interface RaceLocation {
  id: string;
  nombre: string;
  tipo: string;
  descripcion?: string | null;
  ruta: string;
  created_at?: string | null;
}

export interface LocationResponse {
  success: boolean;
  data: RaceLocation;
  error?: string;
}

export interface LocationListResponse {
  success: boolean;
  data: RaceLocation[];
  error?: string;
}

export const getLocations = async (): Promise<LocationListResponse> => {
  const response = await api.get<LocationListResponse>('/locations');
  return response.data;
};

export const createLocation = async (data: {
  nombre: string;
  tipo: string;
  descripcion?: string;
  ruta: string;
}): Promise<LocationResponse> => {
  const response = await api.post<LocationResponse>('/locations', data);
  return response.data;
};

export const deleteLocation = async (id: string): Promise<any> => {
  const response = await api.delete<any>(`/locations/${id}`);
  return response.data;
};
