export interface PresupuestoDetalleView {
  id: number;
  montoAsignado: number;
  montoComprometido: number;
  montoEjercido: number;
  montoDisponible: number;

  periodo: {
    nombre: string;
    fechaInicio: string | Date;
    fechaFin: string | Date;
    estado: EstadoPeriodo;
  };

  centroCosto: {
    nombre: string;
    codigo: string;
    activo: boolean;
  };

  sucursal: string;

  partida: {
    codigo: string;
    nombre: string;
    descripcion: string | null;
  };

  historial: MovimientoHistorial[];
}

export enum EstadoPeriodo {
  ABIERTO = "ABIERTO",
  CERRADO = "CERRADO",
  BLOQUEADO = "BLOQUEADO",
}

export interface MovimientoHistorial {
  id: number;
  fecha: string | Date;
  tipo: TipoMovimientoPresupuesto;
  monto: number;
  descripcion: string | null;
  usuario: string;
  referencia: string;
}

export enum TipoMovimientoPresupuesto {
  ASIGNACION_INICIAL = "ASIGNACION_INICIAL",
  COMPROMISO = "COMPROMISO", // Al aprobar o crear una Requisición
  EJERCICIO = "EJERCICIO", // Al convertir a Compra o CxP
  LIBERACION_COMPROMISO = "LIBERACION_COMPROMISO", // Rollback (Rechazo/Anulación) de Requisición
  LIBERACION_EJERCICIO = "LIBERACION_EJERCICIO", // Rollback (Anulación) de Compra
  AJUSTE_MANUAL = "AJUSTE_MANUAL", // Para correcciones de auditoría
}
