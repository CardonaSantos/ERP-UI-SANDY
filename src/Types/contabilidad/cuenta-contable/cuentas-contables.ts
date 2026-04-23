import { NaturalezaCuentaContable, TipoCuentaContable } from "../types-enums";

export interface CuentaContable {
  id: number;
  codigo: string;
  nombre: string;

  tipo: TipoCuentaContable;
  naturaleza: NaturalezaCuentaContable;

  nivel: number;

  permiteMovimiento: boolean;
  activa: boolean;

  cuentaPadreId?: number | null;

  creadoEn: string;
  actualizadoEn: string;
}
