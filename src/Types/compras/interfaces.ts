export type CompraEstado =
  | "RECIBIDO"
  | "CANCELADO"
  | "RECIBIDO_PARCIAL"
  | "ESPERANDO_ENTREGA";

export interface CompraProveedorUI {
  id: number | null;
  nombre: string;
}

export interface CompraListItem {
  folioOrigen: string;
  tipoOrigen: string;
  id: number;
  estado: CompraEstado;
  total: number;
  fecha: string | null;
  conFactura: boolean;
  proveedor: CompraProveedorUI | null;
  factura: CompraFacturaUI | null;
  usuario: CompraUsuarioUI;
  requisicion: CompraRequisicionUI | null;
  creadoEn: string | null;
  actualizadoEn: string | null;
  detalles: CompraDetalleUI[];
  resumen: CompraResumenUI;
  pedido: CompraPedidoUI;
}

///-------------------------------------
// ============================================================
// ENUMS & LITERAL TYPES
// ============================================================

export type EstadoCompra =
  | "RECIBIDO"
  | "CANCELADO"
  | "RECIBIDO_PARCIAL"
  | "ESPERANDO_ENTREGA";

export type OrigenCompra = "DIRECTA" | "REQUISICION" | "PEDIDO";

export type RequisitionEstado =
  | "BORRADOR"
  | "PENDIENTE"
  | "APROBADA"
  | "ENVIADA"
  | "RECIBIDA"
  | "COMPLETADA"
  | "CANCELADA"
  | "ENVIADA_COMPRAS";

export type TipoPresentacion =
  | "CUBETA"
  | "BIDON"
  | "TAMBOR"
  | "BLISTER"
  | "UNIDAD"
  | "BOTELLA"
  | "CAJA"
  | "PACK"
  | "SACO";

export type SelectedScope = "PRODUCTO" | "PRESENTACION";
export type SelectedKey = `prod-${number}` | `pres-${number}`;

// ============================================================
// ENTIDADES SIMPLES & EMBEDDED RELATIONS
// ============================================================

export interface SimpleEntityUI {
  id: number;
  nombre: string;
}

export interface CompraUsuarioUI {
  id: number;
  nombre: string;
  correo: string;
}

export interface CompraFacturaUI {
  numero: string | null;
  fecha: string | null;
}

export interface CompraResumenUI {
  items: number;
  cantidadTotal: number;
  subtotal: number;
}

export interface CompraProductoUI {
  id: number;
  nombre: string;
  codigo: string;
  precioCostoActual: number | null;
}

export interface PresentacionMinimalUI {
  id: number;
  nombre: string;
  sku: string | null;
  codigoBarras: string | null;
  tipoPresentacion: TipoPresentacion | null;
  factorUnidadBase: number;
  costoReferencialPresentacion: number;
}

// ============================================================
// COMPRAS (Basado exactamente en tu JSON)
// ============================================================

export interface CompraDetalleUI {
  id: number;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  creadoEn: string | null;
  actualizadoEn: string | null;
  fechaVencimiento: string | null; // 👈 Movido aquí desde la raíz
  producto: CompraProductoUI;
  presentacion: PresentacionMinimalUI | null;
}

export interface CompraRequisicionUI {
  id: number;
  folio: string;
  estado: string; // Puede ser RequisitionEstado si coincide siempre
  fecha: string | null;
  totalLineas: number;
  createdAt: string | null;
  updatedAt: string | null;
  usuario: CompraUsuarioUI;
}

export interface CompraPedidoUI {
  id: number;
  folio: string;
  estado: string;
  fecha: string | null; // ISO
  prioridad: string;
  tipo: string;
  observaciones: string;
  usuario: CompraUsuarioUI;
  cliente: SimpleEntityUI | null;
}

export interface CompraRegistroUI {
  id: number;
  estado: EstadoCompra;
  fecha: string | null;
  total: number;
  conFactura: boolean;
  factura: CompraFacturaUI | null;
  origen: OrigenCompra;
  folioOrigen: string | null;
  proveedor: SimpleEntityUI | null;
  sucursal: SimpleEntityUI | null;
  usuario: CompraUsuarioUI;
  requisicion: CompraRequisicionUI | null;
  pedido: CompraPedidoUI | null;
  creadoEn: string | null;
  actualizadoEn: string | null;
  detalles: CompraDetalleUI[];
  resumen: CompraResumenUI;
}

// ============================================================
// REQUISICIONES
// ============================================================

export interface UsuarioResumen {
  id: number;
  nombre: string;
  rol: "ADMIN" | "USER" | "SUPERVISOR" | string;
}

export interface SucursalResumen {
  id: number;
  nombre: string;
}

export interface ProductoResumen {
  id: number;
  codigoProducto: string;
  nombre: string;
  precioCostoActual: number;
}

export interface PresentacionResumen {
  id: number;
  nombre: string;
  factorUnidadBase: number;
  sku: string | null;
  codigoBarras: string | null;
  tipoPresentacion: string;
  costoReferencialPresentacion: number | null;
}

export interface RequisitionLineDTO {
  id: number;
  productoId: number;
  presentacionId: number | null;
  esPresentacion: boolean;
  cantidadActual: number;
  stockMinimo: number;
  cantidadSugerida: number;
  precioUnitario: number;
  subtotal: number;
  fechaExpiracion: string | null;
  createdAt: string;
  updatedAt: string;
  producto: ProductoResumen;
  presentacion: PresentacionResumen | null;
}

export interface RequisitionResponseDTO {
  id: number;
  folio: string;
  fecha: string;
  sucursalId: number;
  usuarioId: number;
  estado: RequisitionEstado;
  observaciones: string | null;
  totalLineas: number;
  totalRequisicion: number;
  createdAt: string;
  updatedAt: string;
  ingresadaAStock: boolean;
  usuario: UsuarioResumen;
  sucursal: SucursalResumen;
  lineas: RequisitionLineDTO[];
}

// ============================================================
// PAGINACIÓN Y LISTADOS
// ============================================================

export interface PaginatedComprasResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  items: CompraListItem[]; // Reusamos CompraRegistroUI si es idéntico en lista
}

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

// ============================================================
// MUTATION DTOs
// ============================================================

export interface SendToComprasDTO {
  requisicionID: number;
  userID: number;
  proveedorId: number;
  presupuestoId: number; // Añadido basado en tu segundo bloque
}

// ============================================================
// KEY HELPERS
// ============================================================

export const keyForProducto = (id: number): `prod-${number}` => `prod-${id}`;
export const keyForPresentacion = (id: number): `pres-${number}` =>
  `pres-${id}`;

// ============================================================
// UI HELPERS
// ============================================================

export const CLOSED_STATES = new Set<RequisitionEstado>([
  "COMPLETADA",
  "RECIBIDA",
  "ENVIADA_COMPRAS",
]);

export function getReqFlags(req?: RequisitionResponseDTO | null) {
  const estado = req?.estado as RequisitionEstado | undefined;
  const isClosed = !!estado && CLOSED_STATES.has(estado);
  const isEnviadaCompras = estado === "ENVIADA_COMPRAS";
  const canSendToCompras = !!req && !isClosed;
  const canEdit = !!req && !req.ingresadaAStock && !isClosed;

  return {
    isClosed,
    isEnviadaCompras,
    canSendToCompras,
    canEdit,
    sendLabel: isEnviadaCompras
      ? "Enviado a compras"
      : "Enviar lista a módulo compras",
  };
}

export function getEstadoBadgeVariant(
  estado: RequisitionEstado,
): "secondary" | "outline" | "default" | "destructive" {
  switch (estado) {
    case "BORRADOR":
    case "ENVIADA":
    case "ENVIADA_COMPRAS":
      return "secondary";
    case "PENDIENTE":
    case "RECIBIDA":
      return "outline";
    case "APROBADA":
    case "COMPLETADA":
      return "default";
    case "CANCELADA":
      return "destructive";
    default:
      return "secondary";
  }
}
