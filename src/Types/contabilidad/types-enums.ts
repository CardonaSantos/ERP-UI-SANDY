// ================= ENUMS =================

export type TipoCuentaContable =
  | "ACTIVO"
  | "PASIVO"
  | "PATRIMONIO"
  | "INGRESO"
  | "COSTO"
  | "GASTO"
  | "ORDEN";

export type NaturalezaCuentaContable = "DEUDORA" | "ACREEDORA";

export type EstadoAsientoContable = "BORRADOR" | "POSTEADO" | "ANULADO";

export type OrigenAsientoContable =
  | "VENTA"
  | "COMPRA"
  | "MOVIMIENTO_FINANCIERO"
  | "CXP_DOCUMENTO"
  | "CXP_PAGO"
  | "ABONO_CREDITO"
  | "AJUSTE_STOCK"
  | "TRANSFERENCIA"
  | "GARANTIA"
  | "OTRO";

export type MetodoValorizacionInventario = "FIFO" | "PROMEDIO";
