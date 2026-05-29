import api from './api';

export interface Vehicle {
  id: string;
  user_id: string;
  tipo_vehiculo: string;
  marca: string | null;
  modelo: string | null;
  año: number | null;
  color: string | null;
  placa: string | null;
  foto: string | null;
  modificaciones: string | null;
  activo: boolean;
  created_at: string | null;
}

export interface VehicleCreateParams {
  tipo_vehiculo: string;
  marca?: string;
  modelo?: string;
  año?: number;
  color?: string;
  placa?: string;
  foto?: string;
  modificaciones?: string;
  activo?: boolean;
}

export interface VehicleResponse {
  success: boolean;
  message?: string;
  data?: Vehicle;
  error?: string;
}

export interface VehicleListResponse {
  success: boolean;
  data: Vehicle[];
  error?: string;
}

export const listVehicles = async (): Promise<VehicleListResponse> => {
  const response = await api.get<VehicleListResponse>('/vehicles');
  return response.data;
};

export const createVehicle = async (data: VehicleCreateParams): Promise<VehicleResponse> => {
  const response = await api.post<VehicleResponse>('/vehicles', data);
  return response.data;
};

export const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<VehicleResponse> => {
  const response = await api.patch<VehicleResponse>(`/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  const response = await api.delete<{ success: boolean; message?: string; error?: string }>(`/vehicles/${id}`);
  return response.data;
};

