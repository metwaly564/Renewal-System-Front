import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AdminUser {
  id: number;
  email: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<{ data: LoginResponse }>('/auth/login', payload);
  return data.data;
}
