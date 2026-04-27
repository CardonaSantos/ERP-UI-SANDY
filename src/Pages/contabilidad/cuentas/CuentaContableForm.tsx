"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectCuentaContable } from "../shared/SelectCuentaContable";
import {
  NaturalezaCuentaContable,
  TipoCuentaContable,
} from "@/Types/contabilidad/types-enums";
import { NATURALEZAS_CUENTA, TIPOS_CUENTA } from "@/Types/contabilidad/origen";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import { CreateCuentaContableDto } from "@/Types/contabilidad/mutations-types/mutations-types";

interface Props {
  cuentas: CuentaContable[];
  initialData?: CuentaContable;
  isPending: boolean;
  onSubmit: (data: CreateCuentaContableDto) => void;
  onCancel: () => void;
}

export function CuentaContableForm({
  cuentas,
  initialData,
  isPending,
  onSubmit,
  onCancel,
}: Props) {
  const [codigo, setCodigo] = useState(initialData?.codigo ?? "");
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [tipo, setTipo] = useState<TipoCuentaContable>(
    initialData?.tipo ?? "ACTIVO",
  );
  const [naturaleza, setNaturaleza] = useState<NaturalezaCuentaContable>(
    initialData?.naturaleza ?? "DEUDORA",
  );
  const [cuentaPadreId, setCuentaPadreId] = useState<number | null>(
    initialData?.cuentaPadreId ?? null,
  );
  const [permiteMovimiento, setPermiteMovimiento] = useState(
    initialData?.permiteMovimiento ?? true,
  );
  const [activa, setActiva] = useState(initialData?.activo ?? true);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!codigo.trim()) return setError("El código es requerido.");
    if (!nombre.trim()) return setError("El nombre es requerido.");
    onSubmit({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      tipo,
      naturaleza,
      cuentaPadreId,
      permiteMovimiento,
      activa,
    });
  }

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
            placeholder="ej. 1100"
          />
        </div>
        <div>
          <label className={labelClass}>Nombre *</label>
          <input
            className={inputClass}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="ej. Caja y Bancos"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo</label>
          <select
            className={inputClass}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoCuentaContable)}
          >
            {TIPOS_CUENTA.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Naturaleza</label>
          <select
            className={inputClass}
            value={naturaleza}
            onChange={(e) =>
              setNaturaleza(e.target.value as NaturalezaCuentaContable)
            }
          >
            {NATURALEZAS_CUENTA.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Cuenta padre (opcional)</label>
        <SelectCuentaContable
          cuentas={cuentas}
          value={cuentaPadreId}
          onChange={setCuentaPadreId}
          placeholder="Sin cuenta padre"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={permiteMovimiento}
            onChange={(e) => setPermiteMovimiento(e.target.checked)}
            className="h-3 w-3 rounded border-border"
          />
          Permite movimiento
        </label>
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
              : "Crear cuenta"}
        </Button>
      </div>
    </form>
  );
}
