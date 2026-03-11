import { TipoComprobante } from "@/Pages/POS/interfaces";

export interface MetodoPago {
  id: number;
  ventaId: number;
  monto: number;
  metodoPago: string;
  fechaPago: string; // Formato ISO string
}
export interface ProductoInfo {
  id: number;
  nombre: string;
  descripcion: string;
  precioVenta: number;
  codigoProducto: string;
  creadoEn: string; // Formato ISO string
  actualizadoEn: string; // Formato ISO string
}

export interface ProductoVenta {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  creadoEn: string; // Formato ISO string
  producto: ProductoInfo;
  precioVenta: number;
  estado: EstadoDetalleVenta;
}

export interface Cliente {
  id: number;
  dpi: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  creadoEn: string;
  actualizadoEn: string;
  departamentoId: number;
  departamento: Departamento;
  municipio: Municipio;
}

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Municipio {
  id: number;
  nombre: string;
}

export enum EstadoDetalleVenta {
  VENDIDO = "VENDIDO",
  PARCIAL_GARANTIA = "PARCIAL_GARANTIA",
  ANULADO = "ANULADO",
}

export interface Venta {
  id: number;
  clienteId: number | null;
  cliente: null | Cliente; // Ajusta según la estructura de 'cliente' si existe
  fechaVenta: string; // Formato ISO string
  horaVenta: string; // Formato ISO string
  productos: ProductoVenta[];
  totalVenta: number; //TOTAL
  metodoPago: MetodoPago;
  estado: EstadoDetalleVenta;
  //OTROS CAMPOS
  nombreClienteFinal: string;
  telefonoClienteFinal: string;
  direccionClienteFinal: string;
  referenciaPago: string;
  tipoComprobante: TipoComprobante;
}

export type VentasHistorial = Venta[];
export type VentaHistorialPDF = Venta;
