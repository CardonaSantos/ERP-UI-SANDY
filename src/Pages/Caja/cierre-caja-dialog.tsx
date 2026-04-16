"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CuentasBancariasSelect } from "@/Types/CuentasBancarias/CuentasBancariasSelect";
import { useCloseCaja, useGetPreviaCaja } from "@/hooks/use-cajas/use-cajas";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import { ComprobanteTipoZ, schemaBase } from "./schema/schema";
import { useStore } from "@/components/Context/ContextSucursal";
import { CerrarCajaV2Dto } from "./types/cierres.types";

// ============================================================================
// TYPES
// ============================================================================

type CuentaBancaria = {
  id: number;
  banco: string;
  numero: string;
  alias?: string | null;
};

type CierreCajaDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  registroCajaId: number;
  usuarioCierreId: number;
  cuentasBancarias: CuentaBancaria[];
  onClosed?: () => void;
  reloadContext: () => Promise<void>;
  cuentas: CuentasBancariasSelect[];
};

type CierreCajaFormData = z.infer<typeof schemaBase>;

// ============================================================================
// COMPONENT
// ============================================================================

export function CierreCajaDialog({
  open,
  onOpenChange,
  registroCajaId,
  usuarioCierreId,
  onClosed,
  reloadContext,
  cuentas,
}: CierreCajaDialogProps) {
  // --- State & Hooks ---
  const sucursalId = useStore((state) => state.sucursalId) ?? 0;
  const userId = useStore((state) => state.userId) ?? 0;

  const closeCaja = useCloseCaja();
  const getPreviaCaja = useGetPreviaCaja(sucursalId, registroCajaId, userId);
  const previa = getPreviaCaja.data;
  const isLoadingPrevia = getPreviaCaja.isPending;
  const isSubmitting = closeCaja.isPending;

  const form = useForm<CierreCajaFormData>({
    values: getPreviaCaja.data
      ? {
          modo: "SIN_DEPOSITO",
          abrirSiguiente: true,
          asentarVentas: true,
          dejarEnCaja: Number(getPreviaCaja.data.fondoFijoActual ?? 0),
          fondoFijoSiguiente: Number(getPreviaCaja.data.fondoFijoActual ?? 0),
        }
      : undefined,
    resolver: zodResolver(schemaBase),
    defaultValues: {
      modo: "SIN_DEPOSITO",
      abrirSiguiente: true,
      dejarEnCaja: 0,
      asentarVentas: true,
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  // --- Watched Values ---
  const watched = form.watch();

  // --- Calculations ---
  const enCaja = Number(previa?.enCaja ?? 0);
  const dejarEnCaja = Number(watched.dejarEnCaja ?? 0);
  const disponibleOperable = Math.max(0, enCaja - dejarEnCaja);

  const requiereDeposito = ["DEPOSITO_PARCIAL", "DEPOSITO_TODO"].includes(
    watched.modo,
  );

  const calcularDeposito = (): number => {
    if (!previa) return 0;
    if (watched.modo === "DEPOSITO_TODO") return disponibleOperable;
    if (watched.modo === "DEPOSITO_PARCIAL") {
      const v = Number(watched.montoParcial || 0);
      return Math.min(Math.max(v, 0), disponibleOperable);
    }
    return 0;
  };

  const depositoCalculado = calcularDeposito();
  const saldoFinalEsperado = enCaja - depositoCalculado;

  // --- Validations ---
  const cuentaRequeridaError =
    requiereDeposito && !watched.cuentaBancariaId ? "Cuenta requerida" : null;

  const montoParcialError =
    watched.modo === "DEPOSITO_PARCIAL" &&
    Number(watched.montoParcial || 0) <= 0
      ? "Monto > 0"
      : null;

  // --- Handlers ---
  const formatCuentaBancaria = (cuenta: CuentaBancaria) => {
    const numeroMasked = `****${cuenta.numero.slice(-4)}`;
    return `${cuenta.alias || cuenta.banco || numeroMasked}`;
  };

  const onSubmit: SubmitHandler<CierreCajaFormData> = async (data) => {
    if (!previa) return;

    const enCajaLocal = Number(previa.enCaja ?? 0);
    const dejarEnCajaLocal = Number(data.dejarEnCaja ?? 0);
    const disponibleOperableLocal = Math.max(0, enCajaLocal - dejarEnCajaLocal);

    const esDeposito =
      data.modo === "DEPOSITO_PARCIAL" || data.modo === "DEPOSITO_TODO";

    let depositoCalculadoLocal = 0;
    if (data.modo === "DEPOSITO_TODO") {
      depositoCalculadoLocal = disponibleOperableLocal;
    } else if (data.modo === "DEPOSITO_PARCIAL") {
      const v = Number(data.montoParcial || 0);
      depositoCalculadoLocal = Math.min(
        Math.max(v, 0),
        disponibleOperableLocal,
      );
    }

    // Validations
    if (esDeposito && !data.cuentaBancariaId) {
      form.setError("cuentaBancariaId", {
        message: "Cuenta requerida",
      });
      return;
    }

    if (
      data.modo === "DEPOSITO_PARCIAL" &&
      (!data.montoParcial || data.montoParcial <= 0)
    ) {
      form.setError("montoParcial", { message: "Monto > 0" });
      return;
    }

    if (esDeposito && depositoCalculadoLocal <= 0) {
      toast.error("Sin disponible para depositar");
      return;
    }

    if (esDeposito) {
      if (!data.comprobanteTipo) {
        form.setError("comprobanteTipo", {
          message: "Tipo requerido",
        });
        return;
      }
      if (!data.comprobanteNumero?.trim()) {
        form.setError("comprobanteNumero", {
          message: "Número requerido",
        });
        return;
      }
    }

    try {
      const payload: CerrarCajaV2Dto & {
        dejarEnCaja?: number;
        asentarVentas?: boolean;
        comprobanteTipo?: string;
        comprobanteNumero?: string;
        comprobanteFecha?: string;
      } = {
        registroCajaId,
        usuarioCierreId,
        modo: data.modo,
        comentarioFinal: data.comentarioFinal,
        dejarEnCaja: Number(data.dejarEnCaja ?? 0),
        asentarVentas: Boolean(data.asentarVentas ?? true),
      };

      if (esDeposito) {
        payload.cuentaBancariaId = data.cuentaBancariaId!;

        const num = (data.comprobanteNumero ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .toUpperCase()
          .slice(0, 64);

        payload.comprobanteTipo = data.comprobanteTipo!;
        payload.comprobanteNumero = num;

        if (data.comprobanteFecha) {
          payload.comprobanteFecha = new Date(
            `${data.comprobanteFecha}T00:00:00`,
          ).toISOString();
        }

        if (data.modo === "DEPOSITO_PARCIAL") {
          payload.montoParcial = depositoCalculadoLocal;
        } else {
          delete (payload as any).montoParcial;
        }
      }

      if (data.modo === "CAMBIO_TURNO") {
        payload.abrirSiguiente = data.abrirSiguiente ?? true;
        if (payload.abrirSiguiente) {
          payload.usuarioInicioSiguienteId = data.usuarioInicioSiguienteId!;
          payload.fondoFijoSiguiente = data.fondoFijoSiguiente;
          payload.comentarioAperturaSiguiente =
            data.comentarioAperturaSiguiente;
        }
      }

      toast.promise(closeCaja.mutateAsync(payload), {
        success: "Caja cerrada",
        error: (error) => getApiErrorMessageAxios(error),
        loading: "Cerrando...",
      });
      onOpenChange(false);
      onClosed?.();
    } catch (error) {
      console.error("Error cerrando caja:", error);
    } finally {
      await reloadContext();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Cerrar Caja</DialogTitle>
          <DialogDescription className="text-xs">
            Configure cierre y asentamiento de ventas
          </DialogDescription>
        </DialogHeader>

        {isLoadingPrevia ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm">Cargando...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {/* Left Panel - Form Fields */}
                <div className="lg:col-span-3 space-y-3">
                  {/* Modo de cierre */}
                  <FormField
                    control={form.control}
                    name="modo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Modo</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-3 gap-2"
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem
                                value="SIN_DEPOSITO"
                                id="sin-deposito"
                              />
                              <Label
                                htmlFor="sin-deposito"
                                className="text-xs font-normal cursor-pointer"
                              >
                                Cerrar
                              </Label>
                            </div>

                            <div className="flex items-center space-x-1">
                              <RadioGroupItem
                                value="DEPOSITO_PARCIAL"
                                id="deposito-parcial"
                                disabled={disponibleOperable <= 0}
                              />
                              <Label
                                htmlFor="deposito-parcial"
                                className="text-xs font-normal cursor-pointer"
                              >
                                Parcial
                              </Label>
                            </div>

                            <div className="flex items-center space-x-1">
                              <RadioGroupItem
                                value="DEPOSITO_TODO"
                                id="deposito-todo"
                                disabled={disponibleOperable <= 0}
                              />
                              <Label
                                htmlFor="deposito-todo"
                                className="text-xs font-normal cursor-pointer"
                              >
                                Todo
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Row: Asentar ventas & Dejar en caja */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="asentarVentas"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2">
                          <input
                            id="asentar-ventas"
                            type="checkbox"
                            className="h-3 w-3"
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                          <Label
                            htmlFor="asentar-ventas"
                            className="text-xs font-normal cursor-pointer"
                          >
                            Asentar ventas
                          </Label>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dejarEnCaja"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Base</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              max={enCaja}
                              value={Number(field.value ?? 0)}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="h-8 text-xs"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Deposito Section */}
                  {requiereDeposito && (
                    <>
                      {/* Row: Cuenta bancaria & Monto parcial */}
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="cuentaBancariaId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Cuenta *
                              </FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(Number(value))
                                }
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Seleccionar" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cuentas.map((cuenta) => (
                                    <SelectItem
                                      key={cuenta.id}
                                      value={cuenta.id.toString()}
                                      className="text-xs"
                                    >
                                      {formatCuentaBancaria(cuenta)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                              {cuentaRequeridaError && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {cuentaRequeridaError}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />

                        {watched.modo === "DEPOSITO_PARCIAL" && (
                          <FormField
                            control={form.control}
                            name="montoParcial"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Monto *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min={0.01}
                                    max={disponibleOperable}
                                    value={Number(field.value ?? 0)}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                    className="h-8 text-xs"
                                  />
                                </FormControl>
                                {montoParcialError && (
                                  <p className="text-xs text-red-500 mt-0.5">
                                    {montoParcialError}
                                  </p>
                                )}
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Row: Tipo & Número comprobante */}
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="comprobanteTipo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Tipo *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Seleccionar" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ComprobanteTipoZ.options.map((t) => (
                                    <SelectItem
                                      key={t}
                                      value={t}
                                      className="text-xs"
                                    >
                                      {t.replace("_", " ")}
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
                          name="comprobanteNumero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Número *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej. 123456"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  maxLength={64}
                                  className="h-8 text-xs"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Fecha comprobante */}
                      <FormField
                        control={form.control}
                        name="comprobanteFecha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Fecha (opt.)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-8 text-xs"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Comentario final */}
                  <FormField
                    control={form.control}
                    name="comentarioFinal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Comentario (opt.)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notas..."
                            {...field}
                            className="text-xs min-h-[60px] resize-none"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Panel - Summary */}
                <div className="lg:col-span-1">
                  <div className="border rounded p-2  text-xs space-y-2 sticky top-0">
                    <h4 className="font-semibold text-xs">Resumen</h4>

                    <div className="space-y-1.5 border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">En caja:</span>
                        <span className="font-medium">
                          Q {enCaja.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base:</span>
                        <span className="font-medium">
                          Q {dejarEnCaja.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disponible:</span>
                        <span className="font-medium">
                          Q {disponibleOperable.toFixed(2)}
                        </span>
                      </div>

                      <div className="border-t pt-1.5 mt-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Depósito:</span>
                          <span className="font-semibold text-blue-600">
                            Q {depositoCalculado.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saldo final:</span>
                          <span className="font-semibold text-green-600">
                            Q {saldoFinalEsperado.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="pt-2 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-8 text-xs px-3"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="h-8 text-xs px-3"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  {isSubmitting ? "Cerrando..." : "Cerrar Caja"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
