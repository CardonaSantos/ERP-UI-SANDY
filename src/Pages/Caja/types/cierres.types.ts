// ====== cierres.types.ts ======
export type ModoCierre =
  | "SIN_DEPOSITO"
  | "DEPOSITO_AUTO"
  | "DEPOSITO_PARCIAL"
  | "DEPOSITO_TODO"
  | "CAMBIO_TURNO";

export interface PreviaCierreResponse {
  registroCajaId: number;
  enCaja: number; // saldoInicial + Σ deltaCaja del turno
  fondoFijoActual: number; // del turno
  sugeridoDepositarAuto: number; // enCaja - fondoFijoActual (>=0)
  puedeDepositarHasta: number; // = enCaja
}

export interface CerrarCajaV2Dto {
  registroCajaId: number;
  usuarioCierreId: number;
  comentarioFinal?: string;

  modo: ModoCierre;

  // si hay depósito:
  cuentaBancariaId?: number;
  montoParcial?: number; // solo en DEPOSITO_PARCIAL
  objetivoFondo?: number; // si DEPOSITO_AUTO/CAMBIO_TURNO (default: fondoFijo)

  // si CAMBIO_TURNO:
  abrirSiguiente?: boolean; // default true en CAMBIO_TURNO
  usuarioInicioSiguienteId?: number;
  fondoFijoSiguiente?: number;
  comentarioAperturaSiguiente?: string;
}

export interface CerrarCajaV2Response {
  turnoCerrado: { id: number; saldoFinal: number; depositoRealizado: number };
  movimientoDeposito?: { id: number };
  nuevoTurno?: { id: number; saldoInicial: number };
  enCajaAntes: number;
}
