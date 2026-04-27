"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  CreditCard,
  AlertTriangle,
  CircleCheck,
  Loader2,
} from "lucide-react";

import {
  type CrearMovimientoFinancieroDto,
  type MovimientoFinancieroFormProps,
  type MetodoPago,
  type GastoOperativoTipo,
  type CostoVentaTipo,
  MOTIVO_OPTIONS,
  METODO_PAGO_OPTIONS,
  UI_RULES,
  METODOS_CAJA,
} from "./movimientos-financieros";
import { CamposCondicionales } from "../components/campos-condicionales";
import { CampoCuentaBancaria } from "../components/campo-cuenta-bancaria";
import { DepositoCierreControls } from "../components/deposito-cierre-control";
import { ConfirmarMovimientoDialog } from "../components/confirmar-movimiento-dialog";
import {
  useCreateMovimientoFinanciero,
  useGetUltimaCajaAbierta,
} from "@/hooks/use-cajas/use-cajas";
import { useStore } from "@/components/Context/ContextSucursal";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";

export const MOTIVO_VALUES = [
  // --- INGRESOS ---
  "VENTA_CREDITO",
  "COBRO_CREDITO",
  "ANTICIPO_CLIENTE",
  "AJUSTE_SOBRANTE",
  "OTRO_INGRESO",

  // --- EGRESOS / GASTOS ---
  "GASTO_OPERATIVO",
  "COMPRA_MERCADERIA",
  "COMPRA_INSUMOS",
  "COSTO_ASOCIADO",
  "PAGO_PROVEEDOR_BANCO",
  "PAGO_PROVEEDOR_EFECTIVO",
  "PAGO_CREDITO",
  "PAGO_NOMINA",
  "PAGO_ALQUILER",
  "PAGO_SERVICIOS",
  "PAGO_IMPUESTOS",
  "PAGO_COMISIONES",
  "ANTICIPO_PROVEEDOR",
  "AJUSTE_FALTANTE",
  "OTRO_EGRESO",

  // --- MOVIMIENTOS DE CAJA / BANCO ---
  "DEPOSITO_CIERRE",
  "DEPOSITO_PROVEEDOR",
  "BANCO_A_CAJA",
  "CAJA_A_BANCO",

  // --- DEVOLUCIONES ---
  "DEVOLUCION",
  "DEVOLUCION_PROVEEDOR",
] as const;

export type MotivoMovimiento = (typeof MOTIVO_VALUES)[number];

/** Métodos que no necesitan cuenta bancaria (pagan de caja) */
function metodoPagoEsCaja(mp?: MetodoPago): boolean {
  return !mp || METODOS_CAJA.includes(mp);
}

/** Determina si se debe mostrar selector de cuenta bancaria */
function showCuentaBancaria(
  motivo?: MotivoMovimiento,
  metodoPago?: MetodoPago,
): boolean {
  if (!motivo) return false;
  const rules = UI_RULES[motivo];
  if (!rules?.requireCuenta) return false;
  if (typeof rules.requireCuenta === "function")
    return rules.requireCuenta(metodoPago);
  return rules.requireCuenta;
}

const EMPTY_FORM_VALUES = {
  motivo: undefined,
  metodoPago: undefined,
  monto: 0,
  descripcion: "",
  referencia: "",
  proveedorId: undefined,
  cuentaBancariaId: undefined,
  gastoOperativoTipo: undefined,
  costoVentaTipo: undefined,
};

// Estilos custom para react-select
const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: "32px",
    height: "32px",
    fontSize: "0.75rem",
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    "&:hover": {
      borderColor: "#9ca3af",
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: "0.75rem",
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
        ? "#f3f4f6"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#000000",
    padding: "6px 12px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: state.isSelected ? "#3b82f6" : "#f3f4f6",
    },
  }),
  menu: (base: any) => ({
    ...base,
    fontSize: "0.75rem",
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "200px",
  }),
  input: (base: any) => ({
    ...base,
    fontSize: "0.75rem",
    margin: 0,
    padding: 0,
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: "2px 8px",
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    height: "32px",
  }),
};

// ───────── Component ─────────
export function MovimientoFinancieroForm({
  userID,
  proveedores,
  cuentasBancarias,
  getPreviaCerrar,
  reloadContext,
}: MovimientoFinancieroFormProps) {
  const sucursalID = useStore((state) => state.sucursalId) ?? 0;
  const cajaQuery = useGetUltimaCajaAbierta(sucursalID, userID);
  const cajaAbierta = cajaQuery.data ?? null;

  const createMf = useCreateMovimientoFinanciero();

  const [efectivoDisponible, setEfectivoDisponible] = useState<number | null>(
    null,
  );
  const [isDepositoCierreTotal, setIsDepositoCierreTotal] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CrearMovimientoFinancieroDto>({
    defaultValues: {
      sucursalId: 0,
      usuarioId: 0,
      monto: 0,
      motivo: "GASTO_OPERATIVO",
      proveedorId: undefined,
      cuentaBancariaId: undefined,
      gastoOperativoTipo: undefined,
      costoVentaTipo: undefined,
      metodoPago: undefined,
    },
  });

  const watchedMotivo = form.watch("motivo") as MotivoMovimiento | undefined;
  const watchedMetodoPago = form.watch("metodoPago") as MetodoPago | undefined;
  const watchedMonto = form.watch("monto");

  const currentRules = watchedMotivo ? UI_RULES[watchedMotivo] : null;

  const needsCaja = currentRules?.needsCajaIf
    ? typeof currentRules.needsCajaIf === "function"
      ? currentRules.needsCajaIf(watchedMetodoPago)
      : currentRules.needsCajaIf
    : false;

  useEffect(() => {
    if (
      watchedMotivo === "DEPOSITO_CIERRE" ||
      watchedMotivo === "PAGO_PROVEEDOR_BANCO" ||
      watchedMotivo === "BANCO_A_CAJA"
    ) {
      form.setValue("metodoPago", "TRANSFERENCIA");
    }
  }, [watchedMotivo, form]);

  useEffect(() => {
    form.setValue("proveedorId", undefined);
    form.setValue("cuentaBancariaId", undefined);
    form.setValue("gastoOperativoTipo", undefined);
    form.setValue("costoVentaTipo", undefined);
    if (watchedMotivo === "DEPOSITO_CIERRE") {
      setIsDepositoCierreTotal(true);
      setEfectivoDisponible(null);
    }
  }, [watchedMotivo, form]);

  const loadPreviaCierre = async () => {
    if (!getPreviaCerrar) return;
    setLoadingPreview(true);
    try {
      const data = await getPreviaCerrar(sucursalID);
      setEfectivoDisponible(data.efectivoDisponible);
    } catch {
      toast.error("Error al cargar previa de cierre");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleToggleDepositoCierre = async (isTotal: boolean) => {
    setIsDepositoCierreTotal(isTotal);
    if (isTotal) {
      await loadPreviaCierre();
      if (typeof efectivoDisponible === "number")
        form.setValue("monto", efectivoDisponible);
    } else {
      form.setValue("monto", 0);
      await loadPreviaCierre();
    }
  };

  const onSubmit = () => {
    if (needsCaja && !cajaAbierta) {
      toast.error("No hay caja abierta.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const data = form.getValues();
    setIsSubmitting(true);
    setIsConfirmOpen(false);

    try {
      const payload: CrearMovimientoFinancieroDto = {
        sucursalId: sucursalID,
        usuarioId: userID,
        motivo: data.motivo!,
        metodoPago: data.metodoPago as MetodoPago | undefined,
        monto: data.monto,
        descripcion: data.descripcion,
        referencia: data.referencia,
      };

      if (needsCaja && cajaAbierta) payload.registroCajaId = cajaAbierta.id;
      if (data.proveedorId) payload.proveedorId = data.proveedorId;
      if (data.cuentaBancariaId)
        payload.cuentaBancariaId = data.cuentaBancariaId;
      if (data.gastoOperativoTipo)
        payload.gastoOperativoTipo =
          data.gastoOperativoTipo as GastoOperativoTipo;
      if (data.costoVentaTipo)
        payload.costoVentaTipo = data.costoVentaTipo as CostoVentaTipo;
      if (currentRules?.flags?.esDepositoCierre)
        payload.esDepositoCierre = true;
      if (currentRules?.flags?.esDepositoProveedor)
        payload.esDepositoProveedor = true;

      toast.promise(createMf.mutateAsync(payload), {
        loading: "Registrando movimiento...",
        success: () => {
          return "Movimiento registrado";
        },
        error: (error) => getApiErrorMessageAxios(error),
      });

      form.reset(EMPTY_FORM_VALUES);
      setIsDepositoCierreTotal(true);
      setEfectivoDisponible(null);
      if (reloadContext) await reloadContext();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al registrar";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mustShowCuenta = showCuentaBancaria(watchedMotivo, watchedMetodoPago);
  const isMetodoPagoLocked =
    watchedMotivo === "DEPOSITO_CIERRE" ||
    watchedMotivo === "PAGO_PROVEEDOR_BANCO" ||
    watchedMotivo === "BANCO_A_CAJA";

  // Transformar MOTIVO_OPTIONS para react-select
  const motivoOptions = MOTIVO_OPTIONS.map((o) => ({
    value: o.value,
    label: `${o.label} - ${o.desc}`,
  }));

  // Transformar METODO_PAGO_OPTIONS para react-select
  const metodoPagoOptions = METODO_PAGO_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
  }));

  return (
    <div className="">
      <Card className="">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Registrar movimiento
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
              aria-label="Formulario de movimiento financiero"
            >
              {/* Fila 1 — Motivo + Método de pago */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="motivo"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Motivo
                      </FormLabel>
                      <FormControl>
                        <Controller
                          control={form.control}
                          name="motivo"
                          render={({ field: { value, onChange } }) => (
                            <Select
                              inputId="motivo-select"
                              options={motivoOptions}
                              value={
                                motivoOptions.find(
                                  (opt) => opt.value === value,
                                ) || null
                              }
                              onChange={(option) => onChange(option?.value)}
                              styles={selectStyles}
                              isSearchable
                              isClearable={false}
                              placeholder="Selecciona motivo"
                              formatOptionLabel={(option) => (
                                <div className="flex flex-col">
                                  <span className="font-medium text-xs">
                                    {
                                      MOTIVO_OPTIONS.find(
                                        (o) => o.value === option.value,
                                      )?.label
                                    }
                                  </span>
                                  <span className="text-[10px] text-gray-600">
                                    {
                                      MOTIVO_OPTIONS.find(
                                        (o) => o.value === option.value,
                                      )?.desc
                                    }
                                  </span>
                                </div>
                              )}
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metodoPago"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1">
                        <CreditCard className="h-3 w-3" aria-hidden="true" />
                        Método de pago
                      </FormLabel>
                      <FormControl>
                        <Controller
                          control={form.control}
                          name="metodoPago"
                          render={({ field: { value, onChange } }) => (
                            <Select
                              inputId="metodo-pago-select"
                              options={metodoPagoOptions}
                              value={
                                metodoPagoOptions.find(
                                  (opt) => opt.value === value,
                                ) || null
                              }
                              onChange={(option) => onChange(option?.value)}
                              styles={selectStyles}
                              isSearchable={false}
                              isClearable={false}
                              isDisabled={isMetodoPagoLocked}
                              placeholder="Selecciona método"
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campos condicionales (proveedor, subtipo gasto, subtipo costo) */}
              {(currentRules?.requireProveedor ||
                currentRules?.requireSubtipoGO ||
                currentRules?.requireCostoVentaTipo) && (
                <CamposCondicionales
                  form={form}
                  requireProveedor={currentRules?.requireProveedor}
                  requireSubtipoGO={currentRules?.requireSubtipoGO}
                  requireCostoVentaTipo={currentRules?.requireCostoVentaTipo}
                  proveedores={proveedores}
                />
              )}

              {/* Cuenta bancaria — solo si el método NO es efectivo/caja */}
              {mustShowCuenta && !metodoPagoEsCaja(watchedMetodoPago) && (
                <CampoCuentaBancaria
                  form={form}
                  cuentasBancarias={cuentasBancarias}
                />
              )}

              {/* Monto */}
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Monto</FormLabel>
                    <FormControl>
                      {watchedMotivo === "DEPOSITO_CIERRE" &&
                      isDepositoCierreTotal ? (
                        <Input
                          disabled
                          value="Se calculará automáticamente"
                          className="h-8 text-xs text-muted-foreground"
                          aria-label="Monto calculado automáticamente"
                        />
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-xs"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      )}
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Controles depósito de cierre */}
              {watchedMotivo === "DEPOSITO_CIERRE" && (
                <DepositoCierreControls
                  isTotal={isDepositoCierreTotal}
                  onToggle={handleToggleDepositoCierre}
                  loadingPreview={loadingPreview}
                  efectivoDisponible={efectivoDisponible}
                  watchedMonto={watchedMonto}
                />
              )}

              {/* Descripción y referencia */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Descripción{" "}
                        <span className="text-muted-foreground font-normal">
                          (opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="Descripción"
                          className="text-xs resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Referencia{" "}
                        <span className="text-muted-foreground font-normal">
                          (opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nº referencia"
                          className="h-8 text-xs"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Estado de caja */}
              {needsCaja && !cajaAbierta && (
                <div
                  role="alert"
                  className="flex items-center gap-1.5 rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                >
                  <AlertTriangle
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  No hay caja abierta. Abre una caja antes de continuar.
                </div>
              )}

              {needsCaja && cajaAbierta && (
                <div
                  role="status"
                  className="flex items-center gap-1.5 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700"
                >
                  <CircleCheck
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  Caja abierta disponible
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="sm"
                className="w-full text-xs h-8"
                disabled={isSubmitting || (needsCaja && !cajaAbierta)}
                aria-busy={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2
                    className="h-3 w-3 animate-spin mr-1.5"
                    aria-hidden="true"
                  />
                )}
                {isSubmitting ? "Registrando…" : "Registrar movimiento"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ConfirmarMovimientoDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
