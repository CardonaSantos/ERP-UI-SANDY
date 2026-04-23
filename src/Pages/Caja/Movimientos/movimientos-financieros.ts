// ===== Types (espejo de Prisma – frontend) =====

export type ClasificacionAdmin =
  | "INGRESO"
  | "COSTO_VENTA"
  | "GASTO_OPERATIVO"
  | "TRANSFERENCIA"
  | "AJUSTE"
  | "CONTRAVENTA";

export type MotivoMovimiento =
  // existentes
  | "OTRO_INGRESO"
  | "GASTO_OPERATIVO"
  | "COMPRA_MERCADERIA"
  | "COSTO_ASOCIADO"
  | "DEPOSITO_CIERRE"
  | "DEPOSITO_PROVEEDOR"
  | "PAGO_PROVEEDOR_BANCO"
  | "AJUSTE_SOBRANTE"
  | "AJUSTE_FALTANTE"
  | "DEVOLUCION"
  | "BANCO_A_CAJA"

  // nuevos
  | "COBRO_CREDITO"
  | "PAGO_CREDITO"
  | "VENTA_CREDITO"
  | "COMPRA_INSUMOS"
  | "PAGO_PROVEEDOR_EFECTIVO"
  | "PAGO_NOMINA"
  | "PAGO_ALQUILER"
  | "PAGO_SERVICIOS"
  | "PAGO_IMPUESTOS"
  | "PAGO_COMISIONES"
  | "CAJA_A_BANCO"
  | "ANTICIPO_CLIENTE"
  | "ANTICIPO_PROVEEDOR"
  | "DEVOLUCION_PROVEEDOR"
  | "OTRO_EGRESO";

export type MetodoPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "DEPOSITO"
  | "TARJETA"
  | "CHEQUE"
  | "OTRO";

export type GastoOperativoTipo =
  | "SALARIO"
  | "ENERGIA"
  | "LOGISTICA"
  | "RENTA"
  | "INTERNET"
  | "PUBLICIDAD"
  | "VIATICOS"
  | "OTROS"
  // NUEVO
  | "COMBUSTIBLE"
  | "MANTENIMIENTO"
  | "REPUESTOS"
  | "LIMPIEZA"
  | "PAPELERIA"
  | "HERRAMIENTAS"
  | "SEGUROS"
  | "COMISIONES"
  | "IMPUESTOS"
  | "SERVICIOS_TECNICOS";

export type CostoVentaTipo =
  | "MERCADERIA"
  | "FLETE"
  | "ENCOMIENDA"
  | "TRANSPORTE"
  | "OTROS"
  | "MATERIA_PRIMA"
  | "MATERIAL_CONSUMIBLE"
  | "SERVICIOS_TERCEROS"
  | "IMPORTACION";

export interface Proveedor {
  id: number;
  nombre: string;
}

export interface CuentaBancaria {
  id: number;
  banco: string;
  numero: string;
  alias?: string | null;
}

// ===== DTO =====
export interface CrearMovimientoFinancieroDto {
  sucursalId: number;
  usuarioId: number;
  registroCajaId?: number;
  motivo: MotivoMovimiento;
  metodoPago?: MetodoPago;
  monto: number;
  descripcion?: string;
  referencia?: string;
  esDepositoCierre?: boolean;
  esDepositoProveedor?: boolean;
  proveedorId?: number;
  cuentaBancariaId?: number;
  gastoOperativoTipo?: GastoOperativoTipo;
  costoVentaTipo?: CostoVentaTipo;
}

// ===== Form Props =====
export interface MovimientoFinancieroFormProps {
  userID: number;
  proveedores: Proveedor[];
  cuentasBancarias: CuentaBancaria[];
  reloadContext: () => Promise<void>;
  getPreviaCerrar?: (
    sucursalId: number,
  ) => Promise<{ efectivoDisponible: number }>;
}

// ===== Select options =====
export const MOTIVO_OPTIONS = [
  // ===== INGRESOS =====
  {
    value: "OTRO_INGRESO",
    label: "Otro ingreso",
    desc: "Entrada de dinero no clasificada",
  },
  {
    value: "COBRO_CREDITO",
    label: "Cobro de crédito",
    desc: "Pago recibido de cliente a crédito",
  },
  {
    value: "ANTICIPO_CLIENTE",
    label: "Anticipo de cliente",
    desc: "Dinero recibido antes de venta",
  },

  // ===== GASTOS =====
  {
    value: "GASTO_OPERATIVO",
    label: "Gasto operativo",
    desc: "Salida por operación del negocio",
  },
  {
    value: "PAGO_NOMINA",
    label: "Pago de nómina",
    desc: "Pago de salarios",
  },
  {
    value: "PAGO_SERVICIOS",
    label: "Pago de servicios",
    desc: "Luz, agua, internet, etc.",
  },
  {
    value: "PAGO_ALQUILER",
    label: "Pago de alquiler",
    desc: "Pago de renta de local",
  },
  {
    value: "PAGO_IMPUESTOS",
    label: "Pago de impuestos",
    desc: "Pago a entidad fiscal",
  },
  {
    value: "PAGO_COMISIONES",
    label: "Pago de comisiones",
    desc: "Comisiones a terceros",
  },
  {
    value: "OTRO_EGRESO",
    label: "Otro egreso",
    desc: "Salida no categorizada",
  },

  // ===== COMPRAS =====
  {
    value: "COMPRA_MERCADERIA",
    label: "Compra de mercadería",
    desc: "Productos para venta",
  },
  {
    value: "COMPRA_INSUMOS",
    label: "Compra de insumos",
    desc: "Material para operación",
  },
  {
    value: "COSTO_ASOCIADO",
    label: "Costo asociado",
    desc: "Fletes, transporte, etc.",
  },

  // ===== PROVEEDORES =====
  {
    value: "PAGO_PROVEEDOR_BANCO",
    label: "Pago proveedor (banco)",
    desc: "Pago directo desde banco",
  },
  {
    value: "PAGO_PROVEEDOR_EFECTIVO",
    label: "Pago proveedor (efectivo)",
    desc: "Pago en efectivo",
  },
  {
    value: "ANTICIPO_PROVEEDOR",
    label: "Anticipo a proveedor",
    desc: "Pago adelantado",
  },
  {
    value: "DEVOLUCION_PROVEEDOR",
    label: "Devolución proveedor",
    desc: "Reembolso recibido",
  },
  {
    value: "DEPOSITO_PROVEEDOR",
    label: "Depósito a proveedor",
    desc: "Depósito en ventanilla",
  },

  // ===== TRANSFERENCIAS =====
  {
    value: "BANCO_A_CAJA",
    label: "Banco → Caja",
    desc: "Ingreso de efectivo desde banco",
  },
  {
    value: "CAJA_A_BANCO",
    label: "Caja → Banco",
    desc: "Depósito a banco",
  },
  {
    value: "DEPOSITO_CIERRE",
    label: "Depósito de cierre",
    desc: "Depósito total de caja al banco",
  },

  // ===== CRÉDITO =====
  {
    value: "PAGO_CREDITO",
    label: "Pago de crédito",
    desc: "Pago de deuda",
  },
  {
    value: "VENTA_CREDITO",
    label: "Venta a crédito",
    desc: "Venta sin pago inmediato",
  },

  // ===== AJUSTES =====
  {
    value: "AJUSTE_SOBRANTE",
    label: "Ajuste sobrante",
    desc: "Dinero extra en caja",
  },
  {
    value: "AJUSTE_FALTANTE",
    label: "Ajuste faltante",
    desc: "Dinero faltante en caja",
  },

  // ===== DEVOLUCIONES =====
  {
    value: "DEVOLUCION",
    label: "Devolución",
    desc: "Reembolso al cliente",
  },
];

export const METODO_PAGO_OPTIONS: Array<{ value: MetodoPago; label: string }> =
  [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia / Depósito" },
    { value: "TARJETA", label: "Tarjeta" },
    { value: "CHEQUE", label: "Cheque" },
  ];

// Métodos que descuentan de caja / son en efectivo (no requieren cuenta bancaria)
export const METODOS_CAJA: MetodoPago[] = ["EFECTIVO"];

type UiRuleFlags = {
  esDepositoCierre?: boolean;
  esDepositoProveedor?: boolean;
};

type UiRule = {
  needsCajaIf: boolean | ((mp?: MetodoPago) => boolean);
  requireProveedor?: boolean;
  requireCuenta?: boolean | ((mp?: MetodoPago) => boolean);
  requireSubtipoGO?: boolean;
  requireCostoVentaTipo?: boolean;
  flags?: UiRuleFlags;
};

export const UI_RULES: Record<MotivoMovimiento, UiRule> = {
  BANCO_A_CAJA: {
    needsCajaIf: () => true,
    requireCuenta: () => true,
  },
  OTRO_INGRESO: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },
  GASTO_OPERATIVO: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireSubtipoGO: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },
  COMPRA_MERCADERIA: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireProveedor: true,
    requireCostoVentaTipo: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },
  COSTO_ASOCIADO: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireCostoVentaTipo: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },
  DEPOSITO_CIERRE: {
    needsCajaIf: () => true,
    requireCuenta: () => true,
    flags: { esDepositoCierre: true },
  },
  DEPOSITO_PROVEEDOR: {
    needsCajaIf: () => true,
    requireProveedor: true,
    requireCuenta: () => false,
    flags: { esDepositoProveedor: true },
  },
  PAGO_PROVEEDOR_BANCO: {
    needsCajaIf: () => false,
    requireProveedor: true,
    requireCuenta: () => true,
  },
  AJUSTE_SOBRANTE: { needsCajaIf: () => true },
  AJUSTE_FALTANTE: { needsCajaIf: () => true },
  DEVOLUCION: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },
  //NUEVOS
  COBRO_CREDITO: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  PAGO_CREDITO: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  PAGO_NOMINA: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireSubtipoGO: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  PAGO_SERVICIOS: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireSubtipoGO: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  COMPRA_INSUMOS: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireCostoVentaTipo: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  CAJA_A_BANCO: {
    needsCajaIf: () => true,
    requireCuenta: () => true,
  },

  ANTICIPO_CLIENTE: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  ANTICIPO_PROVEEDOR: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireProveedor: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  DEVOLUCION_PROVEEDOR: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireProveedor: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  OTRO_EGRESO: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  // OTROS
  VENTA_CREDITO: {
    needsCajaIf: () => false, // no hay movimiento real de dinero
    requireCuenta: () => false,
  },

  PAGO_PROVEEDOR_EFECTIVO: {
    needsCajaIf: () => true,
    requireProveedor: true,
    requireCuenta: () => false,
  },

  PAGO_ALQUILER: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireSubtipoGO: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  PAGO_IMPUESTOS: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireSubtipoGO: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },

  PAGO_COMISIONES: {
    needsCajaIf: (mp) => mp === "EFECTIVO",
    requireSubtipoGO: true,
    requireCuenta: (mp) => mp !== "EFECTIVO",
  },
};
