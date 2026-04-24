"use client";

import { useState } from "react";
import { FlaskConical, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import { OrigenAsientoContable } from "@/Types/contabilidad/types-enums";
import {
  ClasificacionAdmin,
  MetodoPago,
  MotivoMovimiento,
} from "@/Pages/Caja/Movimientos/movimientos-financieros";
import { ResolverReglaContableResponse } from "@/Types/contabilidad/resolverResponse";
import { useResolverReglaContable } from "@/hooks/contabilidad/resolver";
import { ResolverReglaContableDto } from "@/Types/contabilidad/mutations-types/mutations-types";
import {
  CLASIFICACIONES,
  METODOS_PAGO,
  MOTIVOS,
  ORIGENES_ASIENTO,
} from "@/Types/contabilidad/origen";
// import {
//   CuentaContable,
//   ResolverReglaContableDto,
//   ResolverReglaContableResponse,
// } from "@/lib/contabilidad/entity-types";
// import {
//   ClasificacionAdmin,
//   MetodoPago,
//   MotivoMovimiento,
//   OrigenAsientoContable,
//   CLASIFICACIONES,
//   METODOS_PAGO,
//   MOTIVOS,
//   ORIGENES_ASIENTO,
// } from "@/lib/contabilidad/types-enums";
// import { useResolverReglaContable } from "@/lib/contabilidad/hooks";

interface Props {
  cuentas: CuentaContable[];
}

export function SimuladorReglas({ cuentas }: Props) {
  const [origen, setOrigen] = useState<OrigenAsientoContable>("VENTA");
  const [clasificacion, setClasificacion] = useState<ClasificacionAdmin | "">(
    "",
  );
  const [motivo, setMotivo] = useState<MotivoMovimiento | "">("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago | "">("");

  const [result, setResult] = useState<ResolverReglaContableResponse | null>(
    null,
  );
  const [resolveError, setResolveError] = useState<string | null>(null);

  const { mutate, isPending } = useResolverReglaContable();

  function getCuentaNombre(id: number) {
    const c = cuentas.find((c) => c.id === id);
    return c ? `${c.codigo} — ${c.nombre}` : `ID:${id}`;
  }

  function getCuenta(id: number) {
    return cuentas.find((c) => c.id === id);
  }

  function handleSimular(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setResolveError(null);

    const payload: ResolverReglaContableDto = {
      origen,
      ...(clasificacion ? { clasificacion } : {}),
      ...(motivo ? { motivo } : {}),
      ...(metodoPago ? { metodoPago } : {}),
    };

    mutate(payload, {
      onSuccess: (res) => setResult(res),
      // onError: (err) => setResolveError(err),
    });
  }

  function handleLimpiar() {
    setResult(null);
    setResolveError(null);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
  const labelClass = "block text-xs text-muted-foreground mb-1";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Simulador de Reglas</span>
        <span className="text-xs text-muted-foreground">
          — Prueba qué regla aplica antes de registrar un movimiento real.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Form */}
        <div className="rounded-md border border-border bg-background p-4 space-y-3">
          <p className="text-xs font-medium text-foreground">
            Parámetros de contexto
          </p>
          <form onSubmit={handleSimular} className="space-y-3">
            <div>
              <label className={labelClass}>Origen *</label>
              <select
                className={inputClass}
                value={origen}
                onChange={(e) => {
                  setOrigen(e.target.value as OrigenAsientoContable);
                  handleLimpiar();
                }}
              >
                {ORIGENES_ASIENTO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Clasificación</label>
              <select
                className={inputClass}
                value={clasificacion}
                onChange={(e) => {
                  setClasificacion(e.target.value as ClasificacionAdmin | "");
                  handleLimpiar();
                }}
              >
                <option value="">No especificada</option>
                {CLASIFICACIONES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Motivo</label>
              <select
                className={inputClass}
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value as MotivoMovimiento | "");
                  handleLimpiar();
                }}
              >
                <option value="">No especificado</option>
                {MOTIVOS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Método de pago</label>
              <select
                className={inputClass}
                value={metodoPago}
                onChange={(e) => {
                  setMetodoPago(e.target.value as MetodoPago | "");
                  handleLimpiar();
                }}
              >
                <option value="">No especificado</option>
                {METODOS_PAGO.map((mp) => (
                  <option key={mp.value} value={mp.value}>
                    {mp.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-7 text-xs w-full gap-1"
              disabled={isPending}
            >
              {isPending ? "Resolviendo..." : "Simular regla"}
              {!isPending && <ArrowRight className="h-3 w-3" />}
            </Button>
          </form>
        </div>

        {/* Result */}
        <div className="rounded-md border border-border bg-background p-4 space-y-3 min-h-[200px] flex flex-col justify-start">
          <p className="text-xs font-medium text-foreground">Resultado</p>

          {!result && !resolveError && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">
                Configura los parámetros y ejecuta la simulación para ver qué
                regla aplica.
              </p>
            </div>
          )}

          {resolveError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-700">
                  Sin coincidencia
                </p>
                <p className="text-xs text-red-600 mt-0.5">{resolveError}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-emerald-700">
                    Regla encontrada
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    La regla <strong>{result.codigo}</strong> aplica con
                    prioridad <strong>{result.prioridad}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="rounded-md bg-muted/40 border border-border p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Regla</p>
                  <p className="text-xs font-medium text-foreground">
                    {result.codigo} — {result.nombre}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border bg-blue-50/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Cuenta Debe
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {getCuentaNombre(result.cuentaDebeId)}
                    </p>
                    {getCuenta(result.cuentaDebeId) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getCuenta(result.cuentaDebeId)?.tipo} ·{" "}
                        {getCuenta(result.cuentaDebeId)?.naturaleza}
                      </p>
                    )}
                  </div>
                  <div className="rounded-md border border-border bg-orange-50/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Cuenta Haber
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {getCuentaNombre(result.cuentaHaberId)}
                    </p>
                    {getCuenta(result.cuentaHaberId) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getCuenta(result.cuentaHaberId)?.tipo} ·{" "}
                        {getCuenta(result.cuentaHaberId)?.naturaleza}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
