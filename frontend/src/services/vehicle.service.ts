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
    `/vehicles/admin/all?${queryParams.toString()}`
  );
  return response.data;
};

export const adminDeleteVehicle = async (id: string): Promise<AdminDeleteVehicleResponse> => {
  const response = await api.delete<AdminDeleteVehicleResponse>(`/vehicles/admin/${id}`);
  return response.data;
};
