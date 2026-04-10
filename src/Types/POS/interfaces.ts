/**
 * Tipos compartidos del Punto de Venta.
 * NO duplicar en otros archivos – importar desde aquí.
 */

export enum RolPrecio {
  PUBLICO = "PUBLICO",
  MAYORISTA = "MAYORISTA",
  ESPECIAL = "ESPECIAL",
  DISTRIBUIDOR = "DISTRIBUIDOR",
  PROMOCION = "PROMOCION",
  CLIENTE_ESPECIAL = "CLIENTE_ESPECIAL",
}

export type SourceType = "producto" | "presentacion";

export type Stock = {
  id: number;
  cantidad: number;
  fechaIngreso: string;
  fechaVencimiento: string;
};

export type Precios = {
  id: number;
  precio: number;
  rol: RolPrecio;
};

export type imagenesProducto = {
  id: number;
  url: string;
};

export type ProductoPOS = {
  id: number;
  source: SourceType;
  nombre: string;
  descripcion: string;
  precioVenta: number;
  codigoProducto: string;
  creadoEn: string;
  actualizadoEn: string;
  stock: Stock[];
  precios: Precios[];
  imagenesProducto: imagenesProducto[];
};

export interface CartItem {
  uid: string;
  id: number;
  source: SourceType;
  nombre: string;
  quantity: number;
  selectedPriceId: number;
  selectedPrice: number;
  selectedPriceRole: RolPrecio;
  precios: Precios[];
  stock: { cantidad: number }[];
}

export interface Customer {
  id: number;
  nombre: string;
  telefono?: string;
  dpi?: string;
  nit?: string;
}

export interface CustomerOption {
  value: number;
  label: string;
}

/** Estado exclusivo del Modo Rápido/Escáner.
 *  Solo se crea aquí porque es funcionalidad nueva. */
export interface ScannerModeState {
  /** true = Modo Rápido activo */
  isScanning: boolean;
  /** Código tecleado/escaneado en el input del escáner */
  scanInput: string;
}
