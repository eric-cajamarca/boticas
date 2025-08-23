// src/app/shared/models/empresa.model.ts
export interface Empresa {
  id?: number;
  ruc: string;
  razonSocial: string;
  rubro: string;
  direccion: string;
  distrito: string;
  region: string;
  provincia: string;
  celular: string;
  correo: string;
  alias: string;
  activo?: boolean;
}