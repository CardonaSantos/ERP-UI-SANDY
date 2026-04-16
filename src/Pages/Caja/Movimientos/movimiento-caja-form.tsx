"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  type MotivoMovimiento,
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

const MOTIVO_VALUES = [
  "GASTO_OPERATIVO",
  "COMPRA_MERCADERIA",
  "COSTO_ASOCIADO",
  "DEPOSITO_CIERRE",
  "DEPOSITO_PROVEEDOR",
  "PAGO_PROVEEDOR_BANCO",
  "AJUSTE_SOBRANTE",
  "AJUSTE_FALTANTE",
  "DEVOLUCION",
  "BANCO_A_CAJA",
] as const;

const METODO_PAGO_VALUES = [
  "EFECTIVO",
  "TRANSFERENCIA",
  "DEPOSITO",
  "TARJETA",
  "CHEQUE",
  "OTRO",
] as const;

const GASTO_OPERATIVO_VALUES = [
  "SALARIO",
  "ENERGIA",
  "LOGISTICA",
  "RENTA",
  "INTERNET",
  "PUBLICIDAD",
  "VIATICOS",
  "OTROS",
] as const;

const COSTO_VENTA_VALUES = [
  "MERCADERIA",
  "FLETE",
  "ENCOMIENDA",
  "TRANSPORTE",
  "OTROS",
] as const;

const createSchema = (
  motivo?: MotivoMovimiento,
  metodoPago?: MetodoPago,
  isDepositoCierreTotal?: boolean,
  efectivoDisponible?: number,
) => {
  const rules = motivo ? UI_RULES[motivo] : null;

  return z.object({
    motivo: z.enum(MOTIVO_VALUES, { message: "El motivo es requerido" }),

    metodoPago: z
      .enum(METODO_PAGO_VALUES)
      .optional()
      .refine((val) => {
        if (
          motivo === "DEPOSITO_CIERRE" ||
          motivo === "PAGO_PROVEEDOR_BANCO" ||
          motivo === "BANCO_A_CAJA"
        ) {
          return val === "TRANSFERENCIA" || val === "DEPOSITO";
        }
        return true;
      }, "Método de pago inválido para este motivo"),

    monto: z
      .number()
      .refine((val) => {
        if (motivo === "DEPOSITO_CIERRE" && isDepositoCierreTotal) return true;
        return val > 0;
      }, "El monto debe ser mayor a 0")
      .refine(
        (val) => {
          if (
            motivo === "DEPOSITO_CIERRE" &&
            !isDepositoCierreTotal &&
            typeof efectivoDisponible === "number"
          ) {
            return val <= efectivoDisponible;
          }
          return true;
        },
        `No puedes depositar más de Q ${efectivoDisponible?.toFixed(2) ?? 0}`,
      ),

    descripcion: z.string().optional(),
    referencia: z.string().optional(),

    proveedorId: z
      .number()
      .optional()
      .refine(
        (val) => (rules?.requireProveedor ? val !== undefined : true),
        "Proveedor es requerido",
      ),

    cuentaBancariaId: z
      .number()
      .optional()
      .refine((val) => {
        if (typeof rules?.requireCuenta === "function")
          return rules.requireCuenta(metodoPago) ? val !== undefined : true;
        if (rules?.requireCuenta === true) return val !== undefined;
        return true;
      }, "Cuenta bancaria es requerida"),

    gastoOperativoTipo: z
      .enum(GASTO_OPERATIVO_VALUES)
      .optional()
      .refine(
        (val) => (rules?.requireSubtipoGO ? val !== undefined : true),
        "Tipo de gasto requerido",
      ),

    costoVentaTipo: z
      .enum(COSTO_VENTA_VALUES)
      .optional()
      .refine(
        (val) => (rules?.requireCostoVentaTipo ? val !== undefined : true),
        "Tipo de costo requerido",
      ),
  });
};

type FormData = z.infer<ReturnType<typeof createSchema>>;

// ───────── Helpers UI ─────────
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

  const form = useForm<FormData>({
    resolver: zodResolver(
      createSchema(
        undefined,
        undefined,
        isDepositoCierreTotal,
        efectivoDisponible ?? undefined,
      ),
    ),
    defaultValues: {
      motivo: undefined,
      metodoPago: undefined,
      monto: 0,
      descripcion: "",
      referencia: "",
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
        // registroCajaId: caja
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

      // createMovimientoFinanciero

      toast.promise(createMf.mutateAsync(payload), {
        loading: "Registrando movimiento...",
        success: () => {
          return "Movimiento registrado";
        },
        error: (error) => getApiErrorMessageAxios(error),
      });

      form.reset();
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Motivo
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Selecciona motivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOTIVO_OPTIONS.map((o) => (
                            <SelectItem
                              key={o.value}
                              value={o.value}
                              className="text-xs"
                            >
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metodoPago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1">
                        <CreditCard className="h-3 w-3" aria-hidden="true" />
                        Método de pago
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isMetodoPagoLocked}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Selecciona método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {METODO_PAGO_OPTIONS.map((o) => (
                            <SelectItem
                              key={o.value}
                              value={o.value}
                              className="text-xs"
                            >
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  {/* ({formattFechaWithMinutes(cajaAbierta.fechaApertura)}) */}
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
