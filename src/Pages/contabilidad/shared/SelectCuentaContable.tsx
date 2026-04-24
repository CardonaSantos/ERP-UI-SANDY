"use client";

import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";

interface Props {
  cuentas: CuentaContable[];
  value: number | null | undefined;
  onChange: (id: number | null) => void;
  placeholder?: string;
  soloPermiteMovimiento?: boolean;
  disabled?: boolean;
  id?: string;
}

export function SelectCuentaContable({
  cuentas,
  value,
  onChange,
  placeholder = "Seleccionar cuenta...",
  soloPermiteMovimiento = false,
  disabled = false,
  id,
}: Props) {
  const lista = soloPermiteMovimiento
    ? cuentas.filter((c) => c.permiteMovimiento && c.activo)
    : cuentas;

  return (
    <select
      id={id}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {lista.map((c) => (
        <option key={c.id} value={c.id}>
          {c.codigo} — {c.nombre}
        </option>
      ))}
    </select>
  );
}
