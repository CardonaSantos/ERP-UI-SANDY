import { OrigenAsientoContable } from "../types-enums";

export interface ReglaContable {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;

  origen: OrigenAsientoContable;

  clasificacion?: string | null; // puedes luego tiparlo
  motivo?: string | null; // MotivoMovimiento
  metodoPago?: string | null; // MetodoPago

  cuentaDebeId: number;
  cuentaHaberId: number;

  usaCentroCosto: boolean;
  usaPartidaPresupuestal: boolean;

  activa: boolean;
  prioridad: number;

  creadoEn: string;
  actualizadoEn: string;
}
