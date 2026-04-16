// ===== Types (espejo de Prisma – frontend) =====

export type ClasificacionAdmin =
  | "INGRESO"
  | "COSTO_VENTA"
  | "GASTO_OPERATIVO"
  | "TRANSFERENCIA"
  | "AJUSTE"
  | "CONTRAVENTA";

export type MotivoMovimiento =
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
  | "BANCO_A_CAJA";

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
  | "OTROS";

export type CostoVentaTipo =
  | "MERCADERIA"
  | "FLETE"
  | "ENCOMIENDA"
  | "TRANSPORTE"
  | "OTROS";

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
export const MOTIVO_OPTIONS: Array<{ value: MotivoMovimiento; label: string }> =
  [
    { value: "BANCO_A_CAJA", label: "Banco → Caja" },
    { value: "GASTO_OPERATIVO", label: "Gasto operativo" },
    { value: "COMPRA_MERCADERIA", label: "Compra mercadería" },
    { value: "COSTO_ASOCIADO", label: "Costo asociado (flete/encomienda)" },
    { value: "DEPOSITO_PROVEEDOR", label: "Depósito a proveedor (efectivo)" },
    { value: "PAGO_PROVEEDOR_BANCO", label: "Pago a proveedor (banco)" },
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
};
