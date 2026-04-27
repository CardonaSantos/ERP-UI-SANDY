import {
  ClasificacionAdmin,
  MetodoPago,
  MotivoMovimiento,
} from "@/Pages/Caja/Movimientos/movimientos-financieros";
import { EstadoAsientoContable, OrigenAsientoContable } from "./types-enums";
import { EstadoTurnoCaja } from "@/Pages/Caja/types/interfaces";
// import { MetodoPago } from "@/utils/components/SelectMethodPayment/PurchasePaymentFormDialog";

export interface ReportQueryBase {
  fechaInicio?: Date;
  fechaFin?: Date;
  sucursalId?: number;
  usuarioId?: number;
  cuentaContableId?: number;
  clienteId?: number;
  proveedorId?: number;
  cuentaBancariaId?: number;
  registroCajaId?: number;
  motivo?: MotivoMovimiento;
  clasificacion?: ClasificacionAdmin;
  metodoPago?: MetodoPago;
  origen?: OrigenAsientoContable;
  search?: string;
}
export interface ReportQueryPaged extends ReportQueryBase {
  page?: number;
  limit?: number;
}

export interface QueryLibroDiario extends ReportQueryBase {
  estado?: EstadoAsientoContable;
}

export interface QueryLibroMayor extends ReportQueryBase {
  cuentaContableId: number;
}
export interface QueryBalanceComprobacion extends ReportQueryBase {
  estado?: EstadoAsientoContable;
}

export interface QueryEstadoResultados extends ReportQueryBase {
  estado?: EstadoAsientoContable;
}

export interface QueryFlujoCaja extends ReportQueryBase {}
export interface QueryEstadoCajaTurno extends ReportQueryBase {
  estado?: EstadoTurnoCaja;
}

export interface QueryEstadoCuentaContable extends ReportQueryBase {
  cuentaContableId: number;
}
export interface QueryEstadoCuentaCliente extends ReportQueryBase {
  clienteId: number;
}
export interface QueryEstadoCuentaProveedor extends ReportQueryBase {
  proveedorId: number;
}
export interface QueryReporteVentas extends ReportQueryBase {}
export interface QueryReporteGastos extends ReportQueryBase {}
export interface QueryReporteReglasContables extends ReportQueryBase {
  estado?: "ACTIVA" | "INACTIVA";
}
export interface QueryMovimientosSinAsiento extends ReportQueryBase {}
export interface QueryEstadoBancario extends ReportQueryBase {}
