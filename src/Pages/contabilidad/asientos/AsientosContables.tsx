"use client";

import { useState } from "react";
import { Layers, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// import {
//   AsientoContable,
//   CuentaContable,
// } from "@/lib/contabilidad/entity-types";
import { BadgeEstadoAsiento, EmptyState, LoadingRows } from "../shared/badges";
import { AsientoDetalle } from "./AsientoDetalle";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import { EstadoAsientoContable } from "@/Types/contabilidad/types-enums";
import { useGetAsientosContables } from "@/hooks/contabilidad/asientos-contables.hooks";
import { AsientoContable } from "@/Types/contabilidad/asientos-contables/asiento-contables";
import { ORIGENES_ASIENTO } from "@/Types/contabilidad/origen";
// import { useGetAsientosContables } from "@/lib/contabilidad/hooks";
// import { EstadoAsientoContable, ORIGENES_ASIENTO } from "@/lib/contabilidad/types-enums";

interface Props {
  cuentas: CuentaContable[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n);

const ESTADOS: { value: EstadoAsientoContable | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "BORRADOR", label: "Borrador" },
  { value: "POSTEADO", label: "Posteado" },
  { value: "ANULADO", label: "Anulado" },
];

export function AsientosContables({ cuentas }: Props) {
  const { data: asientos, isLoading } = useGetAsientosContables();
  const [selected, setSelected] = useState<AsientoContable | null>(null);
  const [filterEstado, setFilterEstado] = useState<EstadoAsientoContable | "">(
    "",
  );
  const [filterOrigen, setFilterOrigen] = useState("");

  const lista = (asientos ?? [])
    .filter(
      (a) =>
        (!filterEstado || a.estado === filterEstado) &&
        (!filterOrigen || a.origen === filterOrigen),
    )
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  console.log("Los asientos son: ", asientos);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Asientos Contables</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {(asientos ?? []).length} asientos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterEstado}
            onChange={(e) =>
              setFilterEstado(e.target.value as EstadoAsientoContable | "")
            }
            className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {ESTADOS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filterOrigen}
            onChange={(e) => setFilterOrigen(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos los orígenes</option>
            {ORIGENES_ASIENTO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Fecha
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Descripción
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Origen
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Estado
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Debe
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Haber
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <LoadingRows cols={8} />
            ) : lista.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState message="No hay asientos contables registrados." />
                </td>
              </tr>
            ) : (
              lista.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-mono text-muted-foreground">
                    #{a.id}
                  </td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap">
                    {new Date(a.fecha).toLocaleDateString("es-PE")}
                  </td>
                  <td className="px-3 py-2 text-foreground max-w-[180px] truncate">
                    {a.descripcion}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {ORIGENES_ASIENTO.find((o) => o.value === a.origen)
                      ?.label ?? a.origen}
                  </td>
                  <td className="px-3 py-2">
                    <BadgeEstadoAsiento estado={a.estado} />
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">
                    {fmt(a.totalDebe)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">
                    {fmt(a.totalHaber)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelected(a)}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {!isLoading && lista.length > 0 && (
        <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
          <span>
            Total debe:{" "}
            <strong className="text-foreground">
              {fmt(lista.reduce((s, a) => s + a.totalDebe, 0))}
            </strong>
          </span>
          <span>
            Total haber:{" "}
            <strong className="text-foreground">
              {fmt(lista.reduce((s, a) => s + a.totalHaber, 0))}
            </strong>
          </span>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-sm">Detalle del Asiento</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {selected && (
              <AsientoDetalle
                asiento={selected}
                cuentas={cuentas}
                onClose={() => setSelected(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
