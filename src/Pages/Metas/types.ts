export interface MetaCobros {
  id: number; // ID de la meta
  usuarioId: number; // ID del usuario al que pertenece la meta
  sucursalId: number; // ID de la sucursal asociada a la meta
  fechaCreado: string; // Fecha de creación de la meta (ISO 8601)
  fechaInicio: string; // Fecha de inicio de la meta (ISO 8601)
  fechaFin: string; // Fecha de fin de la meta (ISO 8601)
  montoMeta: number; // Monto objetivo de la meta
  montoActual: number; // Monto acumulado actual
  cumplida: boolean; // Indica si la meta fue cumplida
  fechaCumplida: string | null; // Fecha en que se cumplió la meta, si aplica
  numeroDepositos: number; // Número de depósitos asociados a la meta
  tituloMeta: string; // Título descriptivo de la meta
  DepositoCobro: DepositoCobro[]; // Lista de depósitos asociados a la meta
  sucursal: Sucursal; // Información de la sucursal
  usuario: Usuario; // Información del usuario
  estado: EstadoMetaCobro;

  estadoMetaCobro?: string;
}

export enum EstadoMetaCobro {
  CANCELADO = "CANCELADO",
  ABIERTO = "ABIERTO",
  FINALIZADO = "FINALIZADO",
  CERRADO = "CERRADO",
}

export interface DepositoCobro {
  id: number; // ID del depósito
  usuarioId: number; // ID del usuario que realizó el depósito
  sucursalId: number; // ID de la sucursal asociada al depósito
  numeroBoleta: string; // Número de boleta o comprobante del depósito
  fechaRegistro: string; // Fecha de registro del depósito (ISO 8601)
  montoDepositado: number; // Monto del depósito realizado
  descripcion: string; // Descripción adicional del depósito
  metaCobroId: number; // ID de la meta a la que está asociado el depósito
}

export interface Sucursal {
  id: number; // ID de la sucursal
  nombre: string; // Nombre de la sucursal
  direccion: string; // Dirección de la sucursal
  telefono: string; // Teléfonos de contacto
  pbx: string; // PBX de la sucursal
}

export interface Usuario {
  id: number; // ID del usuario
  nombre: string; // Nombre del usuario
  rol: string; // Rol del usuario (por ejemplo, ADMIN, VENDEDOR, etc.)
}

export enum EstadoMetaTienda {
  CANCELADO = "CANCELADO",
  ABIERTO = "ABIERTO",
  FINALIZADO = "FINALIZADO",
  CERRADO = "CERRADO",
}
export enum EstadoMetaSelect {
  CANCELADO = "CANCELADO",
  CERRADO = "CERRADO",
  ABIERTO = "ABIERTO",
  FINALIZADO = "FINALIZADO",
}

export enum EstadoMetaSelectCumplida {
  CERRADO = "CERRADO",
  CANCELADO = "CANCELADO",
}

export interface MetaTienda {
  id: number;
  cumplida: boolean;
  fechaCumplida: string | null;
  fechaFin: string;
  fechaInicio: string;
  montoActual: number;
  montoMeta: number;
  numeroVentas: number;
  sucursalId: number;
  tituloMeta: string;
  usuarioId: number;
  sucursal: SucursalMetaTiendas;
  usuario: UsuarioMetaTiendas;
  estado: EstadoMetaTienda;
  EstadoMetaTienda?: EstadoMetaTienda;
}

export interface SucursalMetaTiendas {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface UsuarioMetaTiendas {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export type TipoMeta = "Tienda" | "Cobro";

export interface MetaInterfaceDTO {
  usuarioId: number | null;
  tipoMeta: TipoMeta;
  tituloMeta: string;
  montoMeta: number;
  fechaFin: string;
  sucursalId: number;
}

export interface UsuarioSucursal {
  id: number; // ID único del usuario
  nombre: string; // Nombre completo del usuario
  correo: string; // Correo electrónico del usuario
  sucursal: Sucursal; // Relación con la sucursal
}
