"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
// import {
//   CuentaContable,
//   CreateReglaContableDto,
//   ReglaContable,
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
import { SelectCuentaContable } from "../shared/SelectCuentaContable";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import { ReglaContable } from "@/Types/contabilidad/regla-contable/regla-contable";
import { CreateReglaContableDto } from "@/Types/contabilidad/mutations-types/mutations-types";
import { OrigenAsientoContable } from "@/Types/contabilidad/types-enums";
import {
  ClasificacionAdmin,
  MotivoMovimiento,
} from "@/Pages/Caja/Movimientos/movimientos-financieros";
import { MetodoPago } from "@/Pages/Warranty/interfaces2.interfaces";
import {
  CLASIFICACIONES,
  METODOS_PAGO,
  MOTIVOS,
  ORIGENES_ASIENTO,
} from "@/Types/contabilidad/origen";

interface Props {
  cuentas: CuentaContable[];
  reglas: ReglaContable[];
  initialData?: ReglaContable;
  isPending: boolean;
  onSubmit: (data: CreateReglaContableDto) => void;
  onCancel: () => void;
}

export function ReglaContableForm({
  cuentas,
  reglas,
  initialData,
  isPending,
  onSubmit,
  onCancel,
}: Props) {
  const [codigo, setCodigo] = useState(initialData?.codigo ?? "");
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(
    initialData?.descripcion ?? "",
  );
  const [origen, setOrigen] = useState<OrigenAsientoContable>(
    initialData?.origen ?? "VENTA",
  );
  const [clasificacion, setClasificacion] = useState<ClasificacionAdmin | "">(
    (initialData?.clasificacion as ClasificacionAdmin) ?? "",
  );
  const [motivo, setMotivo] = useState<MotivoMovimiento | "">(
    (initialData?.motivo as MotivoMovimiento) ?? "",
  );
  const [metodoPago, setMetodoPago] = useState<MetodoPago | "">(
    (initialData?.metodoPago as MetodoPago) ?? "",
  );
  const [cuentaDebeId, setCuentaDebeId] = useState<number | null>(
    initialData?.cuentaDebeId ?? null,
  );
  const [cuentaHaberId, setCuentaHaberId] = useState<number | null>(
    initialData?.cuentaHaberId ?? null,
  );
  const [prioridad, setPrioridad] = useState(initialData?.prioridad ?? 50);
  const [activa, setActiva] = useState(initialData?.activa ?? true);
  const [error, setError] = useState<string | null>(null);

  // Conflict detection: same origin + clasificacion + motivo + metodoPago
  const conflictingReglas = reglas.filter(
    (r) =>
      r.id !== initialData?.id &&
      r.origen === origen &&
      (r.clasificacion ?? "") === clasificacion &&
      (r.motivo ?? "") === motivo &&
      (r.metodoPago ?? "") === metodoPago,
  );

  const sameCuentaWarning =
    cuentaDebeId !== null && cuentaDebeId === cuentaHaberId;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!codigo.trim()) return setError("El código es requerido.");
    if (!nombre.trim()) return setError("El nombre es requerido.");
    if (!cuentaDebeId) return setError("Selecciona la cuenta de debe.");
    if (!cuentaHaberId) return setError("Selecciona la cuenta de haber.");
    if (cuentaDebeId === cuentaHaberId)
      return setError("La cuenta de debe y haber no pueden ser la misma.");

    onSubmit({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      origen,
      clasificacion: clasificacion || null,
      motivo: motivo || null,
      metodoPago: metodoPago || null,
      cuentaDebeId,
      cuentaHaberId,
      prioridad,
      activa,
    });
  }
  console.log("Las cuentas a usar son:_ ", cuentas);

  const labelClass = "block text-xs text-muted-foreground mb-1";
  const inputClass =
    "w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Código *</label>
          <input
            className={inputClass}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="ej. RGL-001"
          />
        </div>
        <div>
          <label className={labelClass}>Nombre *</label>
          <input
            className={inputClass}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="ej. Venta contado"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <input
          className={inputClass}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción opcional..."
        />
      </div>

      {/* Contexto de resolución */}
      <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
        <p className="text-xs font-medium text-foreground">
          Contexto de resolución
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Origen *</label>
            <select
              className={inputClass}
              value={origen}
              onChange={(e) =>
                setOrigen(e.target.value as OrigenAsientoContable)
              }
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
              onChange={(e) =>
                setClasificacion(e.target.value as ClasificacionAdmin | "")
              }
            >
              <option value="">Cualquiera</option>
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
              onChange={(e) =>
                setMotivo(e.target.value as MotivoMovimiento | "")
              }
            >
              <option value="">Cualquiera</option>
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
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago | "")}
            >
              <option value="">Cualquiera</option>
              {METODOS_PAGO.map((mp) => (
                <option key={mp.value} value={mp.value}>
                  {mp.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {conflictingReglas.length > 0 && (
          <div className="flex items-start gap-1.5 rounded bg-amber-50 border border-amber-200 p-2">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              Conflicto de prioridad con:{" "}
              {conflictingReglas.map((r) => r.codigo).join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Cuentas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Cuenta debe *</label>
          <SelectCuentaContable
            cuentas={cuentas}
            value={cuentaDebeId}
            onChange={setCuentaDebeId}
            soloPermiteMovimiento
            placeholder="Cuenta debe..."
          />
        </div>
        <div>
          <label className={labelClass}>Cuenta haber *</label>
          <SelectCuentaContable
            cuentas={cuentas}
            value={cuentaHaberId}
            onChange={setCuentaHaberId}
            soloPermiteMovimiento
            placeholder="Cuenta haber..."
          />
        </div>
      </div>

      {sameCuentaWarning && (
        <p className="text-xs text-destructive">
          La cuenta de debe y haber no pueden ser la misma.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className={labelClass}>Prioridad</label>
          <input
            type="number"
            min={1}
            max={999}
            className={inputClass}
            value={prioridad}
            onChange={(e) => setPrioridad(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground mt-0.5">
            Menor número = mayor prioridad
          </p>
        </div>
        <div className="flex items-center gap-4 pb-1">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={activa}
              onChange={(e) => setActiva(e.target.checked)}
              className="h-3 w-3 rounded border-border"
            />
            Activa
          </label>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          className="h-7 text-xs"
          disabled={isPending}
        >
          {isPending
            ? "Guardando..."
            : initialData
              ? "Actualizar"
              : "Crear regla"}
        </Button>
      </div>
    </form>
  );
}
