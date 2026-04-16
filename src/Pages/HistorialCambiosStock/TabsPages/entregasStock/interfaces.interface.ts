import { Proveedor } from "@/Pages/Caja/Movimientos/types";

export interface HistorialEntregaStockResponse {
  data: HistorialEntregaStockItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface HistorialEntregaStockItem {
  id: number;
  comentario: string;
  usuario: Usuario;
  cantidadAnterior: number;
  cantidadNueva: number;
  tipo: "ENTREGA_STOCK"; // o string si manejas más tipos
  fechaCambio: string;
  sucursal: Sucursal;
  producto: ProductoConCategorias;
  entregaStock: EntregaStockDetalle;
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface ProductoConCategorias {
  id: number;
  nombre: string;
  codigoProducto: string;
  codigoProveedor: string | null;
  descripcion: string;
  categorias: Categoria[];
  imagenesProducto: any[]; // tipa si es necesario
}

export interface EntregaStockDetalle {
  id: number;
  fechaEntrega: string;
  montoTotal: number;
  sucursal: Sucursal;
  proveedor: Proveedor;
  usuarioRecibido: Usuario;
}
