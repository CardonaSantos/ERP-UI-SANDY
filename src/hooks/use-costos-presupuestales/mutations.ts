export interface CreatePresupuestoDto {
  periodoId: number;
  centroCostoId: number;
  partidaId: number;
  montoAsignado: number;
}

export interface CreatePartidaDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface CreatePeriodoDto {
  nombre: string;
  fechaInicio: string | Date;
  fechaFin: string | Date;
}
