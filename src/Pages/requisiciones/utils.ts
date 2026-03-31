export interface StockAlertItem {
  productoId: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  precioCosto: number;
  /** cantidad que falta para llegar al stock mínimo (>= 1) */
  cantidadSugerida: number;
  id: number;
  codigoProducto: string;
  //nuevos para feedback
  foliosPendientes: string[];
  tieneSolicitudPendiente: boolean;
}
export interface RequisitionLineInput {
  productoId: number;
  /** cantidad final que deseas pedir (>= 1) */
  cantidadSugerida: number;
  fechaExpiracion: Date | null;
}

export interface CreateRequisitionDto {
  sucursalId: number;
  usuarioId: number;
  observaciones?: string;
  // proveedorId: number;
  lineas: RequisitionLineInput[];
}

export interface RequisitionResponse {
  id: number;
  folio: string;
  fecha: string; // ISO
  estado: "PENDIENTE" | "APROBADA";
  sucursalId: number;
  usuarioId: number;
  observaciones?: string;
  totalLineas: number;
  lineas: {
    id: number;
    productoId: number;
    cantidadSugerida: number;
    cantidadActual: number;
    stockMinimo: number;
  }[];
}
