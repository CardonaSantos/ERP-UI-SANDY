"use client";

import { X, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { AsientoContable, CuentaContable } from "@/lib/contabilidad/entity-types";
import { BadgeEstadoAsiento } from "../shared/badges";
import { AsientoContable } from "@/Types/contabilidad/asientos-contables/asiento-contables";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import { useAnularAsientoContable } from "@/hooks/contabilidad/asientos-contables.hooks";
import { ORIGENES_ASIENTO } from "@/Types/contabilidad/origen";
// import { ORIGENES_ASIENTO } from "@/lib/contabilidad/types-enums";
// import { useAnularAsientoContable } from "@/lib/contabilidad/hooks";

interface Props {
  asiento: AsientoContable;
  cuentas: CuentaContable[];
  onClose: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n);

export function AsientoDetalle({ asiento, cuentas, onClose }: Props) {
  const anularMutation = useAnularAsientoContable(asiento.id);

  function getCuentaNombre(id: number) {
    const c = cuentas.find((c) => c.id === id);
    return c ? `${c.codigo} ${c.nombre}` : `ID:${id}`;
  }

  const origenLabel =
    ORIGENES_ASIENTO.find((o) => o.value === asiento.origen)?.label ??
    asiento.origen;

  const puedeAnular = asiento.estado !== "ANULADO";

  function handleAnular() {
    anularMutation.mutate(undefined as unknown as void, {
      onSuccess: onClose,
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Asiento #{asiento.id}
            </span>
            <BadgeEstadoAsiento estado={asiento.estado} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {asiento.descripcion}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="rounded-md bg-muted/40 border border-border p-2">
          <p className="text-muted-foreground">Fecha</p>
          <p className="font-medium text-foreground mt-0.5">
            {new Date(asiento.fecha).toLocaleDateString("es-PE")}
          </p>
        </div>
        <div className="rounded-md bg-muted/40 border border-border p-2">
          <p className="text-muted-foreground">Origen</p>
          <p className="font-medium text-foreground mt-0.5">{origenLabel}</p>
        </div>
        <div className="rounded-md bg-muted/40 border border-border p-2">
          <p className="text-muted-foreground">Referencia</p>
          <p className="font-medium text-foreground mt-0.5">
            {asiento.referencia ?? "—"}
          </p>
        </div>
      </div>

      {/* Líneas */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">
          Líneas contables
        </p>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Cuenta
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Descripción
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Debe
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Haber
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {asiento.lineas.map((l) => (
                <tr key={l.id} className="hover:bg-muted/20">
                  <td className="px-3 py-2 text-foreground">
                    {getCuentaNombre(l.cuentaContableId)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {l.descripcion ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">
                    {l.debe > 0 ? fmt(l.debe) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">
                    {l.haber > 0 ? fmt(l.haber) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 border-t border-border font-medium">
                <td colSpan={2} className="px-3 py-2 text-xs text-foreground">
                  Total
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                  {fmt(asiento.totalDebe)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                  {fmt(asiento.totalHaber)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Balance check */}
      <div
        className={`text-xs flex items-center gap-1.5 ${
          asiento.totalDebe === asiento.totalHaber
            ? "text-emerald-600"
            : "text-destructive"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            asiento.totalDebe === asiento.totalHaber
              ? "bg-emerald-500"
              : "bg-destructive"
          }`}
        />
        {asiento.totalDebe === asiento.totalHaber
          ? "El asiento está balanceado"
          : "El asiento no está balanceado"}
      </div>

      {/* Actions */}
      {puedeAnular && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={handleAnular}
            disabled={anularMutation.isPending}
          >
            <Ban className="h-3 w-3" />
            {anularMutation.isPending ? "Anulando..." : "Anular asiento"}
          </Button>
        </div>
      )}
    </div>
  );
}
