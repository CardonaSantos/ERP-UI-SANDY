import { imagenesProducto } from "@/Pages/POS/PuntoVenta";

enum RolPrecio {
  PUBLICO = "PUBLICO",
  MAYORISTA = "MAYORISTA",
  ESPECIAL = "ESPECIAL",
  DISTRIBUIDOR = "DISTRIBUIDOR",
  PROMOCION = "PROMOCION",
  CLIENTE_ESPECIAL = "CLIENTE_ESPECIAL",
}

type Stock = {
  id: number;
  cantidad: number;
  fechaIngreso: string; // En formato ISO
  fechaVencimiento: string; // En formato ISO
};

export type Precios = {
  id: number;
  precio: number;
  rol: RolPrecio;
};

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precioVenta: number; //NO SE USA XD
  codigoProducto: string;
  creadoEn: string; // En formato ISO
  actualizadoEn: string; // En formato ISO
  stock: Stock[];
  precios: Precios[];
  imagenesProducto: imagenesProducto[];
};

export type ProductosResponse = Producto;
export type ProductosCart = Producto;
