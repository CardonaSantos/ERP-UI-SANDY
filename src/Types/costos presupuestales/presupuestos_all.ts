export interface PresupuestoListItem {
  id: number;
  montoAsignado: number;
  montoComprometido: number;
  montoEjercido: number;
  montoDisponible: number;

  // Datos del Periodo
  periodo: {
    nombre: string;
    fechaInicio: string; // ISO Date String
    fechaFin: string; // ISO Date String
    estado: boolean;
  };

  // Datos del Centro de Costo
  centroCosto: {
    activo: boolean;
    codigo: string;
    nombre: string;
  };

  // Sucursal aplanada (muy útil para columnas de tabla)
  sucursal: string;

  // Datos de la Partida
  partida: {
    codigo: string;
    nombre: string;
    descripcion: string;
  };

  /** * En el listado general suele venir vacío para ahorrar ancho de banda,
   * pero mantenemos la interfaz por consistencia.
   */
  historial: any[]; //NO SE VA A OCUPAR NUNCA, NO SE MAPEA
}
