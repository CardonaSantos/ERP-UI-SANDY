"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  BookMarked,
  Scale,
  TrendingUp,
  Landmark,
  Clock,
  User,
  Truck,
  ShoppingCart,
  Receipt,
  FileText,
  AlertCircle,
  Building2,
} from "lucide-react";
import { SingleValue } from "react-select";
import {
  EstadoAsientoContable,
  OrigenAsientoContable,
} from "@/Types/contabilidad/types-enums";
import { SelectOption } from "./types";
import {
  ClasificacionAdmin,
  MetodoPago,
  MotivoMovimiento,
} from "@/Pages/Caja/Movimientos/movimientos-financieros";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import { Proveedor } from "@/Pages/Caja/Movimientos/types";
import { SucursalResponseSelect } from "@/hooks/getSucursales/Interfaces/interfaces";
import { CuentasBancariasSelect } from "@/Types/CuentasBancarias/CuentasBancariasSelect";
import { UsersSelectResponse } from "@/Types/users/users-types";
import { SelectField } from "./select-fields";
import { ReportCard } from "./report-card";
import { DateRangePicker } from "./date-picker";
import { EstadoTurnoCaja } from "@/Pages/CajaRegistros/utils/estadoStyles";
import { ClientSelect } from "@/Types/clients/cliente-select";

// import { DateRangePicker } from "./date-range-picker";
// import { ReportCard } from "./report-card";
// import { SelectField } from "./select-field";
// import {
//   CuentaContable,
//   CuentasBancariasSelect,
//   Proveedor,
//   Cliente,
//   SucursalResponseSelect,
//   UsersSelectResponse,
//   SelectOption,
//   EstadoAsientoContable,
//   EstadoTurnoCaja,
//   OrigenAsientoContable,
//   MetodoPago,
//   MotivoMovimiento,
//   ClasificacionAdmin,
// } from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function toOption<T extends { id: number }>(
  item: T,
  labelFn: (i: T) => string,
): SelectOption {
  return { value: item.id, label: labelFn(item) };
}

const downloadFile = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ─── Opciones estáticas ──────────────────────────────────────────────────────

const ESTADO_ASIENTO_OPTIONS: SelectOption<EstadoAsientoContable>[] = [
  { value: "ANULADO", label: "Pendiente" },
  { value: "BORRADOR", label: "Aprobado" },
  { value: "POSTEADO", label: "Rechazado" },
];

const ESTADO_TURNO_OPTIONS: SelectOption<EstadoTurnoCaja>[] = [
  { value: EstadoTurnoCaja.ABIERTO, label: "Abierto" },
  { value: EstadoTurnoCaja.CERRADO, label: "Cerrado" },
];

const ORIGEN_OPTIONS: SelectOption<OrigenAsientoContable>[] = [
  { value: "ABONO_CREDITO", label: "Abono Crédito" },
  { value: "AJUSTE_STOCK", label: "Ajuste Stock" },

  { value: "COMPRA", label: "Compra" },

  { value: "CXP_DOCUMENTO", label: "CxP Documento" },
  { value: "CXP_PAGO", label: "CxP Pago" },

  { value: "GARANTIA", label: "Garantía" },
  { value: "MOVIMIENTO_FINANCIERO", label: "Movimiento Financiero" },

  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "VENTA", label: "Venta" },
  { value: "OTRO", label: "Otro" },
];

const METODO_PAGO_OPTIONS: SelectOption<MetodoPago>[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CREDITO", label: "Crédito" },
];

const MOTIVO_OPTIONS: SelectOption<MotivoMovimiento>[] = [
  // INGRESOS
  { value: "VENTA", label: "Venta" },
  { value: "OTRO_INGRESO", label: "Otro ingreso" },
  { value: "COBRO_CREDITO", label: "Cobro de crédito" },
  { value: "ANTICIPO_CLIENTE", label: "Anticipo de cliente" },

  // GASTOS / EGRESOS
  { value: "GASTO_OPERATIVO", label: "Gasto operativo" },
  { value: "PAGO_NOMINA", label: "Pago de nómina" },
  { value: "PAGO_ALQUILER", label: "Pago de alquiler" },
  { value: "PAGO_SERVICIOS", label: "Pago de servicios" },
  { value: "PAGO_IMPUESTOS", label: "Pago de impuestos" },
  { value: "PAGO_COMISIONES", label: "Pago de comisiones" },
  { value: "OTRO_EGRESO", label: "Otro egreso" },

  // COMPRAS / COSTOS
  { value: "COMPRA_MERCADERIA", label: "Compra de mercadería" },
  { value: "COMPRA_INSUMOS", label: "Compra de insumos" },
  { value: "COSTO_ASOCIADO", label: "Costo asociado" },

  // PROVEEDORES
  { value: "PAGO_PROVEEDOR_BANCO", label: "Pago proveedor (banco)" },
  { value: "PAGO_PROVEEDOR_EFECTIVO", label: "Pago proveedor (efectivo)" },
  { value: "ANTICIPO_PROVEEDOR", label: "Anticipo a proveedor" },
  { value: "DEVOLUCION_PROVEEDOR", label: "Devolución proveedor" },
  { value: "DEPOSITO_PROVEEDOR", label: "Depósito a proveedor" },

  // TRANSFERENCIAS
  { value: "BANCO_A_CAJA", label: "Banco → Caja" },
  { value: "CAJA_A_BANCO", label: "Caja → Banco" },
  { value: "DEPOSITO_CIERRE", label: "Depósito de cierre" },

  // CRÉDITO
  { value: "PAGO_CREDITO", label: "Pago de crédito" },
  { value: "VENTA_CREDITO", label: "Venta a crédito" },

  // AJUSTES
  { value: "AJUSTE_SOBRANTE", label: "Ajuste sobrante" },
  { value: "AJUSTE_FALTANTE", label: "Ajuste faltante" },

  // OTROS
  { value: "DEVOLUCION", label: "Devolución" },
];

const CLASIFICACION_OPTIONS: SelectOption<ClasificacionAdmin>[] = [
  { value: "AJUSTE", label: "Ajuste" },
  { value: "CONTRAVENTA", label: "Contraventa" },
  { value: "COSTO_VENTA", label: "Costo Venta" },
  { value: "GASTO_OPERATIVO", label: "Gasto Operativo" },
  { value: "INGRESO", label: "Ingreso" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
];

const ESTADO_REGLA_OPTIONS: SelectOption<"ACTIVA" | "INACTIVA">[] = [
  { value: "ACTIVA", label: "Activa" },
  { value: "INACTIVA", label: "Inactiva" },
];

// ─── Función genérica de disparo de reporte ──────────────────────────────────

function fireReport(
  mutateAsync: (payload: any) => Promise<Blob>,
  payload: object,
  reportName: string,
) {
  toast.promise(mutateAsync(payload), {
    loading: "Generando reporte...",
    success: (data: Blob) => {
      downloadFile(data, `${reportName}_${Date.now()}.xlsx`);
      return "Reporte generado correctamente";
    },
    error: (err: any) =>
      err?.response?.data?.message ?? "Error al generar el reporte",
  });
}

// ─── Props del componente principal ─────────────────────────────────────────

interface Props {
  cuentasList: CuentaContable[];
  proveedoresList?: Proveedor[];
  clientesList?: ClientSelect[];
  sucursalesList?: SucursalResponseSelect[];
  cuentasBancariasList?: CuentasBancariasSelect[];
  usersList?: UsersSelectResponse[];
  // Hooks de mutación del ERP (tipados como any para desacoplar la demo del ERP)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks?: Record<
    string,
    { mutateAsync: (payload: any) => Promise<Blob>; isPending: boolean }
  >;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function ExcelContabilidadReports({
  cuentasList = [],
  proveedoresList = [],
  clientesList = [],
  sucursalesList = [],
  cuentasBancariasList = [],
  usersList = [],
  hooks = {},
}: Props) {
  console.log("Las sucursale son_ ", sucursalesList);

  // ── Opciones derivadas de listas ──
  const cuentasOptions = cuentasList
    .filter((c) => c.permiteMovimiento && c.activo)
    .map((c) => ({ value: c.id, label: `${c.codigo} - ${c.nombre}` }));

  const proveedoresOptions = proveedoresList.map((p) =>
    toOption(p, (i) => i.nombre),
  );
  const clientesOptions = clientesList.map((c) =>
    toOption(c, (i) => `${i.nombre} `),
  );
  const sucursalesOptions = sucursalesList.map((s) =>
    toOption(s, (i) => i.nombre),
  );
  const bancariasOptions = cuentasBancariasList.map((cb) => ({
    value: cb.id,
    label: `${cb.banco} · ${cb.numero}`,
  }));
  const usersOptions = usersList.map((u) =>
    toOption(u, (i) => `${i.nombre} (${i.rol})`),
  );

  // ── Estado de filtros por reporte ──
  // Balance de Comprobación
  const [balFechaInicio, setBalFechaInicio] = useState<Date | undefined>();
  const [balFechaFin, setBalFechaFin] = useState<Date | undefined>();
  const [balSucursal, setBalSucursal] = useState<SelectOption | null>(null);
  const [balEstado, setBalEstado] =
    useState<SelectOption<EstadoAsientoContable> | null>(null);

  // Libro Diario
  const [diarioFechaInicio, setDiarioFechaInicio] = useState<
    Date | undefined
  >();
  const [diarioFechaFin, setDiarioFechaFin] = useState<Date | undefined>();
  const [diarioSucursal, setDiarioSucursal] = useState<SelectOption | null>(
    null,
  );
  const [diarioUsuario, setDiarioUsuario] = useState<SelectOption | null>(null);
  const [diarioEstado, setDiarioEstado] =
    useState<SelectOption<EstadoAsientoContable> | null>(null);
  const [diarioOrigen, setDiarioOrigen] =
    useState<SelectOption<OrigenAsientoContable> | null>(null);

  // Libro Mayor
  const [mayorFechaInicio, setMayorFechaInicio] = useState<Date | undefined>();
  const [mayorFechaFin, setMayorFechaFin] = useState<Date | undefined>();
  const [mayorCuenta, setMayorCuenta] = useState<SelectOption | null>(null);

  // Estado de Resultados
  const [erFechaInicio, setErFechaInicio] = useState<Date | undefined>();
  const [erFechaFin, setErFechaFin] = useState<Date | undefined>();
  const [erSucursal, setErSucursal] = useState<SelectOption | null>(null);
  const [erEstado, setErEstado] =
    useState<SelectOption<EstadoAsientoContable> | null>(null);

  // Flujo de Caja
  const [flujFechaInicio, setFlujFechaInicio] = useState<Date | undefined>();
  const [flujFechaFin, setFlujFechaFin] = useState<Date | undefined>();
  const [flujSucursal, setFlujSucursal] = useState<SelectOption | null>(null);
  const [flujMotivo, setFlujMotivo] =
    useState<SelectOption<MotivoMovimiento> | null>(null);
  const [flujMetodo, setFlujMetodo] = useState<SelectOption<MetodoPago> | null>(
    null,
  );

  // Estado Caja / Turno
  const [cajFechaInicio, setCajFechaInicio] = useState<Date | undefined>();
  const [cajFechaFin, setCajFechaFin] = useState<Date | undefined>();
  const [cajSucursal, setCajSucursal] = useState<SelectOption | null>(null);
  const [cajEstado, setCajEstado] =
    useState<SelectOption<EstadoTurnoCaja> | null>(null);

  // Estado Cuenta Contable
  const [eccFechaInicio, setEccFechaInicio] = useState<Date | undefined>();
  const [eccFechaFin, setEccFechaFin] = useState<Date | undefined>();
  const [eccCuenta, setEccCuenta] = useState<SelectOption | null>(null);

  // Estado Cuenta Cliente
  const [eclFechaInicio, setEclFechaInicio] = useState<Date | undefined>();
  const [eclFechaFin, setEclFechaFin] = useState<Date | undefined>();
  const [eclCliente, setEclCliente] = useState<SelectOption | null>(null);

  // Estado Cuenta Proveedor
  const [ecpFechaInicio, setEcpFechaInicio] = useState<Date | undefined>();
  const [ecpFechaFin, setEcpFechaFin] = useState<Date | undefined>();
  const [ecpProveedor, setEcpProveedor] = useState<SelectOption | null>(null);

  // Ventas
  const [ventasFechaInicio, setVentasFechaInicio] = useState<
    Date | undefined
  >();
  const [ventasFechaFin, setVentasFechaFin] = useState<Date | undefined>();
  const [ventasSucursal, setVentasSucursal] = useState<SelectOption | null>(
    null,
  );
  const [ventasUsuario, setVentasUsuario] = useState<SelectOption | null>(null);
  const [ventasMetodo, setVentasMetodo] =
    useState<SelectOption<MetodoPago> | null>(null);
  const [ventasCliente, setVentasCliente] = useState<SelectOption | null>(null);

  // Gastos
  const [gastosFechaInicio, setGastosFechaInicio] = useState<
    Date | undefined
  >();
  const [gastosFechaFin, setGastosFechaFin] = useState<Date | undefined>();
  const [gastosSucursal, setGastosSucursal] = useState<SelectOption | null>(
    null,
  );
  const [gastosClasificacion, setGastosClasificacion] =
    useState<SelectOption<ClasificacionAdmin> | null>(null);
  const [gastosMotivo, setGastosMotivo] =
    useState<SelectOption<MotivoMovimiento> | null>(null);

  // Reglas Contables
  const [reglasSucursal, setReglasSucursal] = useState<SelectOption | null>(
    null,
  );
  const [reglasEstado, setReglasEstado] = useState<SelectOption<
    "ACTIVA" | "INACTIVA"
  > | null>(null);

  // Movimientos sin Asiento
  const [movFechaInicio, setMovFechaInicio] = useState<Date | undefined>();
  const [movFechaFin, setMovFechaFin] = useState<Date | undefined>();
  const [movSucursal, setMovSucursal] = useState<SelectOption | null>(null);

  // Estado Bancario
  const [bancFechaInicio, setBancFechaInicio] = useState<Date | undefined>();
  const [bancFechaFin, setBancFechaFin] = useState<Date | undefined>();
  const [bancCuenta, setBancCuenta] = useState<SelectOption | null>(null);
  const [bancSucursal, setBancSucursal] = useState<SelectOption | null>(null);

  // ── Helpers de acceso a hooks ──
  const hook = (key: string) =>
    hooks[key] ?? { mutateAsync: async () => new Blob(), isPending: false };

  return (
    <section className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">
          Reportes de Contabilidad
        </h1>
        <p className="text-sm text-muted-foreground">
          Genera y descarga reportes Excel aplicando los filtros de cada módulo.
        </p>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* ── 1. Balance de Comprobación ── */}
        <ReportCard
          title="Balance de Comprobación"
          description="Saldos de todas las cuentas contables en un período."
          icon={<Scale className="size-4" />}
          badge="Contabilidad"
          isLoading={hook("balanceComprobacion").isPending}
          onGenerate={() =>
            fireReport(
              hook("balanceComprobacion").mutateAsync,
              {
                fechaInicio: balFechaInicio,
                fechaFin: balFechaFin,
                sucursalId: balSucursal?.value,
                estado: balEstado?.value,
              },
              "balance_comprobacion",
            )
          }
        >
          <DateRangePicker
            fechaInicio={balFechaInicio}
            fechaFin={balFechaFin}
            onChangeFechaInicio={(d) => setBalFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setBalFechaFin(d ?? undefined)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Sucursal"
              options={sucursalesOptions}
              value={balSucursal}
              onChange={(v) => setBalSucursal(v as SingleValue<SelectOption>)}
            />
            <SelectField<EstadoAsientoContable>
              label="Estado asiento"
              options={ESTADO_ASIENTO_OPTIONS}
              value={balEstado}
              onChange={(v) =>
                setBalEstado(
                  v as SingleValue<SelectOption<EstadoAsientoContable>>,
                )
              }
            />
          </div>
        </ReportCard>

        {/* ── 2. Libro Diario ── */}
        <ReportCard
          title="Libro Diario"
          description="Registro cronológico de asientos contables."
          icon={<BookOpen className="size-4" />}
          badge="Contabilidad"
          isLoading={hook("libroDiario").isPending}
          onGenerate={() =>
            fireReport(
              hook("libroDiario").mutateAsync,
              {
                fechaInicio: diarioFechaInicio,
                fechaFin: diarioFechaFin,
                sucursalId: diarioSucursal?.value,
                usuarioId: diarioUsuario?.value,
                estado: diarioEstado?.value,
                origen: diarioOrigen?.value,
              },
              "libro_diario",
            )
          }
        >
          <DateRangePicker
            fechaInicio={diarioFechaInicio}
            fechaFin={diarioFechaFin}
            onChangeFechaInicio={(d) => setDiarioFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setDiarioFechaFin(d ?? undefined)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Sucursal"
              options={sucursalesOptions}
              value={diarioSucursal}
              onChange={(v) =>
                setDiarioSucursal(v as SingleValue<SelectOption>)
              }
            />
            <SelectField
              label="Usuario"
              options={usersOptions}
              value={diarioUsuario}
              onChange={(v) => setDiarioUsuario(v as SingleValue<SelectOption>)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField<EstadoAsientoContable>
              label="Estado"
              options={ESTADO_ASIENTO_OPTIONS}
              value={diarioEstado}
              onChange={(v) =>
                setDiarioEstado(
                  v as SingleValue<SelectOption<EstadoAsientoContable>>,
                )
              }
            />
            <SelectField<OrigenAsientoContable>
              label="Origen"
              options={ORIGEN_OPTIONS}
              value={diarioOrigen}
              onChange={(v) =>
                setDiarioOrigen(
                  v as SingleValue<SelectOption<OrigenAsientoContable>>,
                )
              }
            />
          </div>
        </ReportCard>

        {/* ── 3. Libro Mayor ── */}
        <ReportCard
          title="Libro Mayor"
          description="Movimientos agrupados por cuenta contable."
          icon={<BookMarked className="size-4" />}
          badge="Contabilidad"
          isLoading={hook("libroMayor").isPending}
          onGenerate={() => {
            if (!mayorCuenta) {
              toast.warning("Selecciona una cuenta contable.");
              return;
            }
            fireReport(
              hook("libroMayor").mutateAsync,
              {
                cuentaContableId: mayorCuenta.value,
                fechaInicio: mayorFechaInicio,
                fechaFin: mayorFechaFin,
              },
              "libro_mayor",
            );
          }}
        >
          <DateRangePicker
            fechaInicio={mayorFechaInicio}
            fechaFin={mayorFechaFin}
            onChangeFechaInicio={(d) => setMayorFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setMayorFechaFin(d ?? undefined)}
          />
          <SelectField
            label="Cuenta contable"
            options={cuentasOptions}
            value={mayorCuenta}
            onChange={(v) => setMayorCuenta(v as SingleValue<SelectOption>)}
            isRequired
          />
        </ReportCard>

        {/* ── 4. Estado de Resultados ── */}
        <ReportCard
          title="Estado de Resultados"
          description="Ingresos, costos y utilidad en el período."
          icon={<TrendingUp className="size-4" />}
          badge="Financiero"
          isLoading={hook("estadoResultados").isPending}
          onGenerate={() =>
            fireReport(
              hook("estadoResultados").mutateAsync,
              {
                fechaInicio: erFechaInicio,
                fechaFin: erFechaFin,
                sucursalId: erSucursal?.value,
                estado: erEstado?.value,
              },
              "estado_resultados",
            )
          }
        >
          <DateRangePicker
            fechaInicio={erFechaInicio}
            fechaFin={erFechaFin}
            onChangeFechaInicio={(d) => setErFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setErFechaFin(d ?? undefined)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Sucursal"
              options={sucursalesOptions}
              value={erSucursal}
              onChange={(v) => setErSucursal(v as SingleValue<SelectOption>)}
            />
            <SelectField<EstadoAsientoContable>
              label="Estado asiento"
              options={ESTADO_ASIENTO_OPTIONS}
              value={erEstado}
              onChange={(v) =>
                setErEstado(
                  v as SingleValue<SelectOption<EstadoAsientoContable>>,
                )
              }
            />
          </div>
        </ReportCard>

        {/* ── 5. Flujo de Caja ── */}
        <ReportCard
          title="Flujo de Caja"
          description="Entradas y salidas de efectivo en el período."
          icon={<Landmark className="size-4" />}
          badge="Financiero"
          isLoading={hook("flujoCaja").isPending}
          onGenerate={() =>
            fireReport(
              hook("flujoCaja").mutateAsync,
              {
                fechaInicio: flujFechaInicio,
                fechaFin: flujFechaFin,
                sucursalId: flujSucursal?.value,
                motivo: flujMotivo?.value,
                metodoPago: flujMetodo?.value,
              },
              "flujo_caja",
            )
          }
        >
          <DateRangePicker
            fechaInicio={flujFechaInicio}
            fechaFin={flujFechaFin}
            onChangeFechaInicio={(d) => setFlujFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setFlujFechaFin(d ?? undefined)}
          />
          <SelectField
            label="Sucursal"
            options={sucursalesOptions}
            value={flujSucursal}
            onChange={(v) => setFlujSucursal(v as SingleValue<SelectOption>)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField<MotivoMovimiento>
              label="Motivo"
              options={MOTIVO_OPTIONS}
              value={flujMotivo}
              onChange={(v) =>
                setFlujMotivo(v as SingleValue<SelectOption<MotivoMovimiento>>)
              }
            />
            <SelectField<MetodoPago>
              label="Método de pago"
              options={METODO_PAGO_OPTIONS}
              value={flujMetodo}
              onChange={(v) =>
                setFlujMetodo(v as SingleValue<SelectOption<MetodoPago>>)
              }
            />
          </div>
        </ReportCard>

        {/* ── 6. Estado Caja / Turno ── */}
        <ReportCard
          title="Estado de Caja / Turno"
          description="Resumen de turnos de caja por período y estado."
          icon={<Clock className="size-4" />}
          badge="Caja"
          isLoading={hook("estadoCajaTurno").isPending}
          onGenerate={() =>
            fireReport(
              hook("estadoCajaTurno").mutateAsync,
              {
                fechaInicio: cajFechaInicio,
                fechaFin: cajFechaFin,
                sucursalId: cajSucursal?.value,
                estado: cajEstado?.value,
              },
              "estado_caja_turno",
            )
          }
        >
          <DateRangePicker
            fechaInicio={cajFechaInicio}
            fechaFin={cajFechaFin}
            onChangeFechaInicio={(d) => setCajFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setCajFechaFin(d ?? undefined)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Sucursal"
              options={sucursalesOptions}
              value={cajSucursal}
              onChange={(v) => setCajSucursal(v as SingleValue<SelectOption>)}
            />
            <SelectField<EstadoTurnoCaja>
              label="Estado turno"
              options={ESTADO_TURNO_OPTIONS}
              value={cajEstado}
              onChange={(v) =>
                setCajEstado(v as SingleValue<SelectOption<EstadoTurnoCaja>>)
              }
            />
          </div>
        </ReportCard>

        {/* ── 7. Estado Cuenta Contable ── */}
        <ReportCard
          title="Estado Cuenta Contable"
          description="Detalle de movimientos de una cuenta contable específica."
          icon={<FileText className="size-4" />}
          badge="Contabilidad"
          isLoading={hook("estadoCuentaContable").isPending}
          onGenerate={() => {
            if (!eccCuenta) {
              toast.warning("Selecciona una cuenta contable.");
              return;
            }
            fireReport(
              hook("estadoCuentaContable").mutateAsync,
              {
                cuentaContableId: eccCuenta.value,
                fechaInicio: eccFechaInicio,
                fechaFin: eccFechaFin,
              },
              "estado_cuenta_contable",
            );
          }}
        >
          <DateRangePicker
            fechaInicio={eccFechaInicio}
            fechaFin={eccFechaFin}
            onChangeFechaInicio={(d) => setEccFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setEccFechaFin(d ?? undefined)}
          />
          <SelectField
            label="Cuenta contable"
            options={cuentasOptions}
            value={eccCuenta}
            onChange={(v) => setEccCuenta(v as SingleValue<SelectOption>)}
            isRequired
          />
        </ReportCard>

        {/* ── 8. Estado Cuenta Cliente ── */}
        <ReportCard
          title="Estado de Cuenta — Cliente"
          description="Historial de transacciones de un cliente."
          icon={<User className="size-4" />}
          badge="Clientes"
          isLoading={hook("estadoCuentaCliente").isPending}
          onGenerate={() => {
            if (!eclCliente) {
              toast.warning("Selecciona un cliente.");
              return;
            }
            fireReport(
              hook("estadoCuentaCliente").mutateAsync,
              {
                clienteId: eclCliente.value,
                fechaInicio: eclFechaInicio,
                fechaFin: eclFechaFin,
              },
              "estado_cuenta_cliente",
            );
          }}
        >
          <DateRangePicker
            fechaInicio={eclFechaInicio}
            fechaFin={eclFechaFin}
            onChangeFechaInicio={(d) => setEclFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setEclFechaFin(d ?? undefined)}
          />
          <SelectField
            label="Cliente"
            options={clientesOptions}
            value={eclCliente}
            onChange={(v) => setEclCliente(v as SingleValue<SelectOption>)}
            isRequired
          />
        </ReportCard>

        {/* ── 9. Estado Cuenta Proveedor ── */}
        <ReportCard
          title="Estado de Cuenta — Proveedor"
          description="Historial de transacciones de un proveedor."
          icon={<Truck className="size-4" />}
          badge="Proveedores"
          isLoading={hook("estadoCuentaProveedor").isPending}
          onGenerate={() => {
            if (!ecpProveedor) {
              toast.warning("Selecciona un proveedor.");
              return;
            }
            fireReport(
              hook("estadoCuentaProveedor").mutateAsync,
              {
                proveedorId: ecpProveedor.value,
                fechaInicio: ecpFechaInicio,
                fechaFin: ecpFechaFin,
              },
              "estado_cuenta_proveedor",
            );
          }}
        >
          <DateRangePicker
            fechaInicio={ecpFechaInicio}
            fechaFin={ecpFechaFin}
            onChangeFechaInicio={(d) => setEcpFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setEcpFechaFin(d ?? undefined)}
          />
          <SelectField
            label="Proveedor"
            options={proveedoresOptions}
            value={ecpProveedor}
            onChange={(v) => setEcpProveedor(v as SingleValue<SelectOption>)}
            isRequired
          />
        </ReportCard>

        {/* ── 10. Reporte de Ventas ── */}
        <ReportCard
          title="Reporte de Ventas"
          description="Ventas por período, sucursal, usuario y método de pago."
          icon={<ShoppingCart className="size-4" />}
          badge="Ventas"
          isLoading={hook("reporteVentas").isPending}
          onGenerate={() =>
            fireReport(
              hook("reporteVentas").mutateAsync,
              {
                fechaInicio: ventasFechaInicio,
                fechaFin: ventasFechaFin,
                sucursalId: ventasSucursal?.value,
                usuarioId: ventasUsuario?.value,
                metodoPago: ventasMetodo?.value,
                clienteId: ventasCliente?.value,
              },
              "reporte_ventas",
            )
          }
        >
          <DateRangePicker
            fechaInicio={ventasFechaInicio}
            fechaFin={ventasFechaFin}
            onChangeFechaInicio={(d) => setVentasFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setVentasFechaFin(d ?? undefined)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Sucursal"
              options={sucursalesOptions}
              value={ventasSucursal}
              onChange={(v) =>
                setVentasSucursal(v as SingleValue<SelectOption>)
              }
            />
            <SelectField
              label="Usuario"
              options={usersOptions}
              value={ventasUsuario}
              onChange={(v) => setVentasUsuario(v as SingleValue<SelectOption>)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField<MetodoPago>
              label="Método de pago"
              options={METODO_PAGO_OPTIONS}
              value={ventasMetodo}
              onChange={(v) =>
                setVentasMetodo(v as SingleValue<SelectOption<MetodoPago>>)
              }
            />
            <SelectField
              label="Cliente"
              options={clientesOptions}
              value={ventasCliente}
              onChange={(v) => setVentasCliente(v as SingleValue<SelectOption>)}
            />
          </div>
        </ReportCard>

        {/* ── 11. Reporte de Gastos ── */}
        <ReportCard
          title="Reporte de Gastos"
          description="Gastos clasificados por período, motivo y categoría."
          icon={<Receipt className="size-4" />}
          badge="Gastos"
          isLoading={hook("reporteGastos").isPending}
          onGenerate={() =>
            fireReport(
              hook("reporteGastos").mutateAsync,
              {
                fechaInicio: gastosFechaInicio,
                fechaFin: gastosFechaFin,
                sucursalId: gastosSucursal?.value,
                clasificacion: gastosClasificacion?.value,
                motivo: gastosMotivo?.value,
              },
              "reporte_gastos",
            )
          }
        >
          <DateRangePicker
            fechaInicio={gastosFechaInicio}
            fechaFin={gastosFechaFin}
            onChangeFechaInicio={(d) => setGastosFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setGastosFechaFin(d ?? undefined)}
          />
          <SelectField
            label="Sucursal"
            options={sucursalesOptions}
            value={gastosSucursal}
            onChange={(v) => setGastosSucursal(v as SingleValue<SelectOption>)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField<ClasificacionAdmin>
              label="Clasificación"
              options={CLASIFICACION_OPTIONS}
              value={gastosClasificacion}
              onChange={(v) =>
                setGastosClasificacion(
                  v as SingleValue<SelectOption<ClasificacionAdmin>>,
                )
              }
            />
            <SelectField<MotivoMovimiento>
              label="Motivo"
              options={MOTIVO_OPTIONS}
              value={gastosMotivo}
              onChange={(v) =>
                setGastosMotivo(
                  v as SingleValue<SelectOption<MotivoMovimiento>>,
                )
              }
            />
          </div>
        </ReportCard>

        {/* ── 12. Reglas Contables ── */}
        <ReportCard
          title="Reglas Contables"
          description="Listado de reglas de contabilización automática."
          icon={<BookOpen className="size-4" />}
          badge="Configuración"
          isLoading={hook("reporteReglasContables").isPending}
          onGenerate={() =>
            fireReport(
              hook("reporteReglasContables").mutateAsync,
              {
                sucursalId: reglasSucursal?.value,
                estado: reglasEstado?.value,
              },
              "reglas_contables",
            )
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Sucursal"
              options={sucursalesOptions}
              value={reglasSucursal}
              onChange={(v) =>
                setReglasSucursal(v as SingleValue<SelectOption>)
              }
            />
            <SelectField<"ACTIVA" | "INACTIVA">
              label="Estado regla"
              options={ESTADO_REGLA_OPTIONS}
              value={reglasEstado}
              onChange={(v) =>
                setReglasEstado(
                  v as SingleValue<SelectOption<"ACTIVA" | "INACTIVA">>,
                )
              }
            />
          </div>
        </ReportCard>

        {/* ── 13. Movimientos sin Asiento ── */}
        <ReportCard
          title="Movimientos sin Asiento"
          description="Movimientos financieros sin asiento contable generado."
          icon={<AlertCircle className="size-4" />}
          badge="Auditoría"
          isLoading={hook("movimientosSinAsiento").isPending}
          onGenerate={() =>
            fireReport(
              hook("movimientosSinAsiento").mutateAsync,
              {
                fechaInicio: movFechaInicio,
                fechaFin: movFechaFin,
                sucursalId: movSucursal?.value,
              },
              "movimientos_sin_asiento",
            )
          }
        >
          <DateRangePicker
            fechaInicio={movFechaInicio}
            fechaFin={movFechaFin}
            onChangeFechaInicio={(d) => setMovFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setMovFechaFin(d ?? undefined)}
          />
          <SelectField
            label="Sucursal"
            options={sucursalesOptions}
            value={movSucursal}
            onChange={(v) => setMovSucursal(v as SingleValue<SelectOption>)}
          />
        </ReportCard>

        {/* ── 14. Estado Bancario ── */}
        <ReportCard
          title="Estado Bancario"
          description="Conciliación de movimientos con cuentas bancarias."
          icon={<Building2 className="size-4" />}
          badge="Bancos"
          isLoading={hook("estadoBancario").isPending}
          onGenerate={() =>
            fireReport(
              hook("estadoBancario").mutateAsync,
              {
                fechaInicio: bancFechaInicio,
                fechaFin: bancFechaFin,
                cuentaBancariaId: bancCuenta?.value,
                sucursalId: bancSucursal?.value,
              },
              "estado_bancario",
            )
          }
        >
          <DateRangePicker
            fechaInicio={bancFechaInicio}
            fechaFin={bancFechaFin}
            onChangeFechaInicio={(d) => setBancFechaInicio(d ?? undefined)}
            onChangeFechaFin={(d) => setBancFechaFin(d ?? undefined)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Cuenta bancaria"
              options={bancariasOptions}
              value={bancCuenta}
              onChange={(v) => setBancCuenta(v as SingleValue<SelectOption>)}
            />
            <SelectField
              label="Sucursal"
              options={sucursalesOptions}
              value={bancSucursal}
              onChange={(v) => setBancSucursal(v as SingleValue<SelectOption>)}
            />
          </div>
        </ReportCard>
      </div>
    </section>
  );
}
