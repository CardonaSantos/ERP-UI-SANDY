import {
  ClasificacionAdmin,
  MetodoPago,
  MotivoMovimiento,
} from "@/Pages/Caja/Movimientos/movimientos-financieros";
import {
  NaturalezaCuentaContable,
  OrigenAsientoContable,
  TipoCuentaContable,
} from "../types-enums";

export interface CreateCuentaContableDto {
  codigo: string;
  nombre: string;
  tipo: TipoCuentaContable;
  naturaleza: NaturalezaCuentaContable;
  cuentaPadreId?: number | null;
  permiteMovimiento?: boolean;
  activa?: boolean;
}

export interface UpdateCuentaContableDto extends Partial<CreateCuentaContableDto> {
  id: number;
}

/// regla dtos

export interface CreateReglaContableDto {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  origen: OrigenAsientoContable;
  clasificacion?: ClasificacionAdmin | null;
  motivo?: MotivoMovimiento | null;
  metodoPago?: MetodoPago | null;
  cuentaDebeId: number;
  cuentaHaberId: number;
  usaCentroCosto?: boolean;
  usaPartidaPresupuestal?: boolean;
  activa?: boolean;
  prioridad?: number;
}

export interface UpdateReglaContableDto extends Partial<CreateReglaContableDto> {
  id: number;
}

export interface ResolverReglaContableDto {
  origen: OrigenAsientoContable;
  clasificacion?: ClasificacionAdmin;
  motivo?: MotivoMovimiento;
  metodoPago?: MetodoPago;
}

// ASIENTOS CONTABLES
// export type EstadoAsientoContable =
//   | "BORRADOR"
//   | "POSTEADO"
//   | "ANULADO";

export interface CreateAsientoContableLineaDto {
  cuentaContableId: number;
  debe: number;
  haber: number;
  descripcion?: string | null;
  centroCostoId?: number | null;
  partidaPresupuestalId?: number | null;
  proveedorId?: number | null;
  clienteId?: number | null;
  productoId?: number | null;
  ventaId?: number | null;
  compraId?: number | null;
  movimientoFinancieroId?: number | null;
  cxpDocumentoId?: number | null;
  cxpPagoId?: number | null;
  abonoCreditoId?: number | null;
  historialStockId?: number | null;
}

export interface CreateAsientoContableDto {
  fecha?: string;
  descripcion: string;
  referencia?: string | null;
  origen: OrigenAsientoContable;
  origenId?: number | null;
  sucursalId?: number | null;
  usuarioId?: number | null;
  lineas: CreateAsientoContableLineaDto[];
}
