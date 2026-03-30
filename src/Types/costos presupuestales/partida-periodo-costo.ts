export interface Partida {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

export interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "ABIERTO" | "CERRADO";
}

export interface CentroCosto {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  sucursalId: number;
}
