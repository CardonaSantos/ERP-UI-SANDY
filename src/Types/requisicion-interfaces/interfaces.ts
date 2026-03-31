// ============================================================
// ENUMS & LITERAL TYPES
// ============================================================

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
// RESUME / EMBEDDED RELATIONS
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

// ============================================================
// LINE DTOs
// ============================================================

/** DTO de línea que devuelve el servidor */
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

  fechaExpiracion: string | null; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO

  producto: ProductoResumen;
  presentacion: PresentacionResumen | null;
}

/** Línea usada en RequisitionResponse (versión ampliada) */
export interface RequisitionLine {
  id: number;
  productoId: number;
  cantidadActual: number;
  stockMinimo: number;
  cantidadSugerida: number;
  precioUnitario: number;

  subtotal?: number;
  iva?: number;
  moneda?: string;

  createdAt: string; // ISO
  updatedAt: string; // ISO

  producto: ProductoResumen;
  cantidadRecibida?: number;
  fechaExpiracion?: Date | null;
}

// ============================================================
// REQUISITION RESPONSE DTOs
// ============================================================

/** DTO principal que devuelve el servidor en el listado */
export interface RequisitionResponseDTO {
  id: number;
  folio: string;
  fecha: string; // ISO
  sucursalId: number;
  usuarioId: number;
  estado: RequisitionEstado;
  observaciones: string | null;

  totalLineas: number;
  totalRequisicion: number;

  createdAt: string; // ISO
  updatedAt: string; // ISO
  ingresadaAStock: boolean;

  usuario: UsuarioResumen;
  sucursal: SucursalResumen;
  lineas: RequisitionLineDTO[];
}

/** Versión cabecera con relaciones completas */
export interface RequisitionResponse {
  id: number;
  folio: string;
  fecha: string;
  sucursalId: number;
  usuarioId: number;
  estado: RequisitionEstado;
  observaciones?: string;

  totalLineas: number;
  totalRequisicion: number;
  moneda?: string;

  createdAt: string;
  updatedAt: string;

  ingresadaAStock: boolean;
  usuario: UsuarioResumen;
  sucursal: SucursalResumen;
  lineas: RequisitionLine[];
}

// ============================================================
// PRODUCT CANDIDATE (para crear requisición)
// ============================================================

export type RequisitionProductCandidate = {
  productoId: number;
  nombre: string;
  codigoProducto: string | null;
  unidadBase: string;
  precioCostoProducto: number | null;

  stockBase: number;
  stockPresentacionesEq: string; // Decimal string
  stockTotalEq: string; // Decimal string
  stockMinimo: number;
  belowThreshold: boolean;
  faltanteSugerido: number;

  pendientesProductoFolios: string[];

  presentaciones: Array<{
    id: number;
    nombre: string;
    tipoPresentacion: TipoPresentacion;
    factorUnidadBase: string; // Decimal string
    costoReferencialPresentacion: string | null; // Decimal string
    sku: string | null;
    codigoBarras: string | null;
    esDefault: boolean;
    activo: boolean;

    stockCantidadPresentacion: number;
    stockEquivalenteBase: string;
    pendientesFolios: string[];
  }>;
};

// ============================================================
// SELECTED LINE (UI – formulario de creación)
// ============================================================

export type SelectedLine = {
  scope: SelectedScope;
  productoId?: number;
  presentacionId?: number;
  cantidad: number;
  fechaExpiracion: string | null;
  precioCostoUnitario: string; // string para no perder precisión en el input
  actualizarCosto: boolean;
};

// ============================================================
// PAGINATION
// ============================================================

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

// ============================================================
// PRINTABLE UNION
// ============================================================

interface PendingRequisition extends RequisitionResponse {
  estado: "BORRADOR" | "PENDIENTE" | "APROBADA" | "ENVIADA";
}

interface FinishedRequisition extends RequisitionResponse {
  estado: "RECIBIDA" | "COMPLETADA";
  fechaRecepcion: string;
  recepcionLineas: RequisitionLine[];
}

export type RequisitionPrintable = PendingRequisition | FinishedRequisition;

// ============================================================
// MUTATION DTOs
// ============================================================

export interface SendToComprasDTO {
  requisicionID: number;
  userID: number;
  proveedorId: number;
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
      return "secondary";
    case "PENDIENTE":
      return "outline";
    case "APROBADA":
      return "default";
    case "ENVIADA":
      return "secondary";
    case "RECIBIDA":
      return "outline";
    case "COMPLETADA":
      return "default";
    case "CANCELADA":
      return "destructive";
    case "ENVIADA_COMPRAS":
      return "secondary";
    default:
      return "secondary";
  }
}
