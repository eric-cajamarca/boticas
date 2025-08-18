export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}