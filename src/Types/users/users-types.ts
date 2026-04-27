export interface UsersSelectResponse {
  id: number;
  nombre: string;
  rol: string;
  contrasena: string;
  activo: boolean;
  correo: string;
  sucursalId: number;
  fecha_creacion: string | Date;
  fecha_actualizacion: string | Date;
}
