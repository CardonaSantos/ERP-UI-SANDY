export interface AbonoComprobante {
  id: number;
  fecha: string;
  metodoPago: string;
  referenciaPago: string;
  montoTotal: number;
  montoCapital: number;
  montoInteres: number;
  montoMora: number;
  cobradoPor: string;
}

export interface CuotaComprobante {
  cuotaId: number;
  numeroCuota: number;
  totalCuotas: number;
  montoCuota: number;
  montoPagado: number;
  moraAcumulada: number;
  estadoCuota: string;
  fechaVencimiento: string | null;
  fechaPago: string | null;
  comentario: string;
  abono: AbonoComprobante | null;
  credito: {
    id: number;
    numeroCredito: string;
    montoTotalConInteres: number;
    totalPagado: number;
  };
  cliente: {
    id: number;
    nombre: string;
    apellidos: string;
    nombreCompleto: string;
    dpi: string;
    telefono: string;
  };
  sucursal: {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
  } | null;
}
