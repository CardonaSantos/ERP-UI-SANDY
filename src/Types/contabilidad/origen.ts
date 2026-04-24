import {
  ClasificacionAdmin,
  MetodoPago,
  MotivoMovimiento,
} from "@/Pages/Caja/Movimientos/movimientos-financieros";
import {
  NaturalezaCuentaContable,
  OrigenAsientoContable,
  TipoCuentaContable,
} from "./types-enums";

export const ORIGENES_ASIENTO: {
  value: OrigenAsientoContable;
  label: string;
}[] = [
  { value: "VENTA", label: "Venta" },
  { value: "COMPRA", label: "Compra" },
  { value: "MOVIMIENTO_FINANCIERO", label: "Movimiento financiero" },
  { value: "CXP_DOCUMENTO", label: "CxP Documento" },
  { value: "CXP_PAGO", label: "CxP Pago" },
  { value: "ABONO_CREDITO", label: "Abono crédito" },
  { value: "AJUSTE_STOCK", label: "Ajuste de stock" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "GARANTIA", label: "Garantía" },
  { value: "OTRO", label: "Otro" },
];

export const TIPOS_CUENTA: { value: TipoCuentaContable; label: string }[] = [
  { value: "ACTIVO", label: "Activo" },
  { value: "PASIVO", label: "Pasivo" },
  { value: "PATRIMONIO", label: "Patrimonio" },
  { value: "INGRESO", label: "Ingreso" },
  { value: "COSTO", label: "Costo" },
  { value: "GASTO", label: "Gasto" },
  { value: "ORDEN", label: "Orden" },
];

export const NATURALEZAS_CUENTA: {
  value: NaturalezaCuentaContable;
  label: string;
}[] = [
  { value: "DEUDORA", label: "Deudora" },
  { value: "ACREEDORA", label: "Acreedora" },
];

export const CLASIFICACIONES: {
  value: ClasificacionAdmin;
  label: string;
}[] = [
  { value: "INGRESO", label: "Ingreso" },
  { value: "GASTO_OPERATIVO", label: "Gasto operativo" },
  { value: "COSTO_VENTA", label: "Costo de venta" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "AJUSTE", label: "Ajuste" },
  { value: "CONTRAVENTA", label: "Contraventa" },
];

export const MOTIVOS = [
  {
    value: "GASTO_OPERATIVO",
    label: "Gasto operativo",
    desc: "Salida de dinero por operación del negocio",
  },
  {
    value: "COMPRA_MERCADERIA",
    label: "Compra mercadería",
    desc: "Compra de productos para venta",
  },
  {
    value: "COMPRA_INSUMOS",
    label: "Compra insumos",
    desc: "Material para uso interno",
  },
  {
    value: "COBRO_CREDITO",
    label: "Cobro de crédito",
    desc: "Ingreso por pago de cliente",
  },
  {
    value: "PAGO_CREDITO",
    label: "Pago de crédito",
    desc: "Salida por deuda",
  },
  {
    value: "PAGO_PROVEEDOR_BANCO",
    label: "Pago proveedor banco",
    desc: "Transferencia a proveedor",
  },
  {
    value: "PAGO_PROVEEDOR_EFECTIVO",
    label: "Pago proveedor efectivo",
    desc: "Pago en efectivo a proveedor",
  },
  {
    value: "PAGO_SERVICIOS",
    label: "Pago de servicios",
    desc: "Luz, agua, internet, etc.",
  },
  {
    value: "PAGO_NOMINA",
    label: "Pago de nómina",
    desc: "Pago a empleados",
  },
  {
    value: "CAJA_A_BANCO",
    label: "Caja → Banco",
    desc: "Depósito a cuenta bancaria",
  },
  {
    value: "BANCO_A_CAJA",
    label: "Banco → Caja",
    desc: "Retiro desde banco",
  },
  {
    value: "OTRO_EGRESO",
    label: "Otro egreso",
    desc: "Salida no categorizada",
  },
] satisfies {
  value: MotivoMovimiento;
  label: string;
  desc: string;
}[];

export const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
  { value: "OTRO", label: "Otro" },
];
