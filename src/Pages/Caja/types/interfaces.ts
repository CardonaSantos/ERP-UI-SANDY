export interface IniciarCaja {
  sucursalId: number;
  usuarioInicioId: number;
  saldoInicial: number;
  comentario?: string;
}

//MODIFICAR DESPUES PARA ACEPTAR DATA DE EGRESOS Y DEMÁS, CALCULAR EN EL FRONT Y ENVIAR
export interface CerrarCaja {
  comentarioFinal?: string;
  registroCajaId: number;
  usuarioCierra: number;
}

//INTERFACE PARA USAR LA CAJA ABIERTA
export interface CajaAbierta {
  id: number;
  saldoInicial: number;
  comentario?: string;
  fechaApertura: Date;
  sucursalId: number;
  sucursalNombre: string;
  usuarioInicioId: number;
  usuarioInicioNombre: string;
  estado: EstadoTurnoCaja;
  fondoFijo?: number;
}

export enum EstadoTurnoCaja {
  ABIERTO = "ABIERTO",
  CERRADO = "CERRADO",
  ARQUEO = "ARQUEO",
  AJUSTADO = "AJUSTADO",
  ANULADO = "ANULADO",
}
