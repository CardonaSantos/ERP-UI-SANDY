// components/contabilidad/asientos-contables/asientos-contables.tsx
"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PaginationState } from "@tanstack/react-table";
import { AsientoDetalle } from "./AsientoDetalle";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import {
  EstadoAsientoContable,
  OrigenAsientoContable,
} from "@/Types/contabilidad/types-enums";
import { useGetAsientosContables } from "@/hooks/contabilidad/asientos-contables.hooks";
import { AsientoContable } from "@/Types/contabilidad/asientos-contables/asiento-contables";
import { ORIGENES_ASIENTO } from "@/Types/contabilidad/origen";
import { AsientosContablesTable } from "./table/asientos-contables-table";

interface Props {
  cuentas: CuentaContable[];
}

const ESTADOS: { value: EstadoAsientoContable | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "BORRADOR", label: "Borrador" },
  { value: "POSTEADO", label: "Posteado" },
  { value: "ANULADO", label: "Anulado" },
];

export function AsientosContables({ cuentas }: Props) {
  const [selected, setSelected] = useState<AsientoContable | null>(null);
  const [filterEstado, setFilterEstado] = useState<EstadoAsientoContable | "">(
    "",
  );
  const [filterOrigen, setFilterOrigen] = useState<OrigenAsientoContable | "">(
    "",
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useGetAsientosContables({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    estado: filterEstado,
    origen: filterOrigen,
  });

  const asientos = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 0;

  const handleFilterChange = (
    newEstado?: EstadoAsientoContable | "",
    newOrigen?: OrigenAsientoContable | "",
  ) => {
    if (newEstado !== undefined) setFilterEstado(newEstado);
    if (newOrigen !== undefined) setFilterOrigen(newOrigen);
    // Reset a la primera página al filtrar
    // setPagination({ ...pagination, pageIndex: 0 });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-3">
      {/* Header con Filtros */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Asientos Contables</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {total} asientos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterEstado}
            onChange={(e) =>
              handleFilterChange(e.target.value as EstadoAsientoContable | "")
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
            onChange={(e) =>
              handleFilterChange(
                undefined,
                e.target.value as OrigenAsientoContable | "",
              )
            }
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

      {/* Tabla TanStack */}
      <AsientosContablesTable
        data={asientos}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageCount={pageCount}
        onSelectAsiento={setSelected}
      />

      {/* Modal Detalle */}
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
