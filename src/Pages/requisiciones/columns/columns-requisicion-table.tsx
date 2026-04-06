"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ChevronDown,
  ChevronRight,
  Package,
  TriangleAlert,
  RefreshCw,
  ArrowUpDown,
  CalendarIcon,
} from "lucide-react";
import dayjs from "dayjs";
import {
  keyForProducto,
  RequisitionProductCandidate,
  SelectedKey,
  SelectedLine,
} from "@/Types/requisiciones/requisiciones-tables";

export const toFixed2 = (n: number | string | null | undefined) => {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
};

const normalizeDecimal = (s: string | undefined | null) => {
  const v = Number((s ?? "").toString().replace(",", "."));
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
};

export function computePresentacionCostoUnitario(
  costoRef: string | null | undefined,
  precioCostoProducto: number | null | undefined,
  factorUnidadBase: string | number | null | undefined,
): string {
  if (costoRef !== null && costoRef !== undefined && costoRef !== "") {
    return toFixed2(costoRef);
  }
  const base = Number(precioCostoProducto ?? 0);
  const factor = Number(factorUnidadBase ?? 1);
  if (factor > 0) return toFixed2(base * factor);
  return toFixed2(base);
}

export type ColumnActions = {
  selected: Record<SelectedKey, SelectedLine>;
  toggleProducto: (row: RequisitionProductCandidate) => void;
  updateQty: (k: SelectedKey, qty: number) => void;
  updateDate: (k: SelectedKey, val: string) => void;
  updatePrecio: (k: SelectedKey, v: string) => void;
  toggleActualizarCosto: (k: SelectedKey, checked: boolean) => void;
};

function PendingFoliosBadge({ folios }: { folios: string[] }) {
  if (!folios?.length) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ver requisiciones pendientes"
          className="inline-flex items-center text-amber-500 hover:text-amber-600 transition-colors"
        >
          <TriangleAlert className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">
          Requisiciones pendientes
        </p>
        <ul className="space-y-0.5">
          {folios.map((f, i) => (
            <li key={i} className="text-xs flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function StockIndicator({
  belowThreshold,
  stockMinimo,
  stockTotalEq,
}: {
  belowThreshold: boolean;
  stockMinimo: number;
  stockTotalEq: string;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-xs font-mono tabular-nums">
        {Number(stockTotalEq).toFixed(0)}
      </span>
      <span
        className={`text-[10px] tabular-nums ${
          belowThreshold ? "text-red-500" : "text-muted-foreground"
        }`}
      >
        mín {stockMinimo}
      </span>
    </div>
  );
}

function QtyInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <Input
      type="number"
      min={1}
      step={1}
      className="h-7 w-14 text-center text-xs px-1"
      value={value || 1}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={ariaLabel}
    />
  );
}

function PriceInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <Input
      inputMode="decimal"
      step="0.01"
      className="h-7 w-20 text-right font-mono text-xs px-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
    />
  );
}

function DateInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string | null;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="relative inline-flex items-center">
      <CalendarIcon className="absolute left-1.5 w-3 h-3 text-muted-foreground pointer-events-none" />
      <input
        type="date"
        className="h-7 w-32 pl-5 pr-1 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        value={value ? dayjs(value).format("YYYY-MM-DD") : ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
    </div>
  );
}

// ─── builder de columnas ──────────────────────────────────────────────────────

export function buildCandidateColumns(
  actions: ColumnActions,
): ColumnDef<RequisitionProductCandidate>[] {
  const {
    selected,
    toggleProducto,
    updateQty,
    updateDate,
    updatePrecio,
    toggleActualizarCosto,
  } = actions;

  return [
    // ── expander ──────────────────────────────────────────────────────────────
    {
      id: "expander",
      header: () => null,
      size: 32,
      cell: ({ row }) =>
        row.getCanExpand() ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={row.getToggleExpandedHandler()}
            aria-label={row.getIsExpanded() ? "Colapsar" : "Expandir"}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </Button>
        ) : null,
    },

    {
      id: "select",
      header: () => (
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Sel.
        </span>
      ),
      size: 40,
      cell: ({ row }) => {
        const k = keyForProducto(row.original.productoId);
        return (
          <Checkbox
            checked={!!selected[k]}
            onCheckedChange={() => toggleProducto(row.original)}
            aria-label="Seleccionar producto"
            className="block mx-auto"
          />
        );
      },
    },

    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Package className="w-3.5 h-3.5" />
          Producto
          <ArrowUpDown className="w-3 h-3 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-start gap-1.5 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium leading-tight truncate">
                  {r.nombre}
                </span>
                {r.belowThreshold && (
                  <Badge
                    variant="destructive"
                    className="text-[9px] px-1 py-0 h-4 shrink-0"
                  >
                    Stock bajo
                  </Badge>
                )}
                <PendingFoliosBadge folios={r.pendientesProductoFolios} />
              </div>
              {r.codigoProducto && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {r.codigoProducto}
                </span>
              )}
            </div>
          </div>
        );
      },
    },

    {
      id: "stock",
      header: () => (
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Stock
        </span>
      ),
      size: 80,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <StockIndicator
            belowThreshold={r.belowThreshold}
            stockMinimo={r.stockMinimo}
            stockTotalEq={r.stockTotalEq}
          />
        );
      },
    },

    {
      id: "cantidad",
      header: () => (
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Cant.
        </span>
      ),
      size: 70,
      cell: ({ row }) => {
        const k = keyForProducto(row.original.productoId);
        const sel = selected[k];
        if (!sel)
          return (
            <span className="text-[10px] text-muted-foreground font-mono">
              {row.original.faltanteSugerido > 0
                ? `~${row.original.faltanteSugerido}`
                : "—"}
            </span>
          );
        return (
          <QtyInput
            value={sel.cantidad}
            onChange={(v) => updateQty(k, v)}
            ariaLabel="Cantidad producto"
          />
        );
      },
    },
    {
      id: "precio",
      header: () => (
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Precio u.
        </span>
      ),
      size: 96,
      cell: ({ row }) => {
        const k = keyForProducto(row.original.productoId);
        const sel = selected[k];
        if (!sel)
          return (
            <span className="text-[10px] text-muted-foreground font-mono">
              Q {toFixed2(row.original.precioCostoProducto)}
            </span>
          );
        return (
          <PriceInput
            value={sel.precioCostoUnitario}
            onChange={(v) => updatePrecio(k, v)}
            ariaLabel="Precio costo unitario"
          />
        );
      },
    },

    {
      id: "total",
      header: () => (
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Total
        </span>
      ),
      size: 88,
      cell: ({ row }) => {
        const k = keyForProducto(row.original.productoId);
        const sel = selected[k];
        if (!sel)
          return <span className="text-muted-foreground text-xs">—</span>;
        const total =
          Number(sel.precioCostoUnitario || "0") * (sel.cantidad || 0);
        return (
          <span className="text-xs font-mono font-medium tabular-nums">
            Q {toFixed2(total)}
          </span>
        );
      },
    },

    {
      id: "fecha",
      header: () => (
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          F. exp.
        </span>
      ),
      size: 140,
      cell: ({ row }) => {
        const k = keyForProducto(row.original.productoId);
        const sel = selected[k];
        if (!sel)
          return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <DateInput
            value={sel.fechaExpiracion}
            onChange={(v) => updateDate(k, v)}
            ariaLabel="Fecha expiración"
          />
        );
      },
    },

    {
      id: "updCosto",
      header: () => (
        <div
          className="flex items-center gap-0.5"
          title="Actualizar costo maestro"
        >
          <RefreshCw className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Costo
          </span>
        </div>
      ),
      size: 64,
      cell: ({ row }) => {
        const k = keyForProducto(row.original.productoId);
        const sel = selected[k];
        if (!sel)
          return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <Checkbox
            checked={!!sel.actualizarCosto}
            onCheckedChange={(v) => toggleActualizarCosto(k, !!v)}
            aria-label="Actualizar costo maestro"
            className="block mx-auto"
          />
        );
      },
    },
  ];
}

export {
  PendingFoliosBadge,
  QtyInput,
  PriceInput,
  DateInput,
  normalizeDecimal,
};
