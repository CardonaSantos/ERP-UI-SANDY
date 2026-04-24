import { NaturalezaCuentaContable, TipoCuentaContable } from "../types-enums";

export interface CuentaContable {
  id: number;
  codigo: string;
  nombre: string;

  tipo: TipoCuentaContable;
  naturaleza: NaturalezaCuentaContable;

  nivel: number;

  permiteMovimiento: boolean;
  activo: boolean;

  cuentaPadreId?: number | null;

  creadoEn: string;
  actualizadoEn: string;
}
