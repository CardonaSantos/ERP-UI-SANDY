"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { MovimientoTableRow } from "@/Types/movimientos-presupuestales-table/interfaces";
import { columns } from "./column";
import { TipoMovimientoPresupuesto } from "@/Types/costos presupuestales/costos_presupuestales";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatGTQ = (amount: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(amount);

// ── Summary cards ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: "default" | "inflow" | "outflow";
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
  accent = "default",
}: SummaryCardProps) {
  const accentBg = {
    default: "border-slate-200",
    inflow: "border-emerald-200",
    outflow: "border-rose-200",
  }[accent];

  return (
    <article
      className={`rounded-md border p-3 flex items-start gap-2.5 ${accentBg}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-medium leading-none text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-bold mt-1 tabular-nums text-slate-800">
          {value}
        </p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </article>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full rounded" />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  data: MovimientoTableRow[];
  isLoading: boolean;
}

export function MovimientosPresupuestalesTable({ data, isLoading }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const ingresos = data
      .filter((m) => m.tipo === TipoMovimientoPresupuesto.ASIGNACION_INICIAL)
      .reduce((sum, m) => sum + m.monto, 0);

    const egresos = data
      .filter((m) => m.tipo === TipoMovimientoPresupuesto.COMPROMISO)
      .reduce((sum, m) => sum + m.monto, 0);

    const neto = ingresos - egresos;

    return {
      ingresos,
      egresos,
      neto,
      totalMovimientos: data.length,
    };
  }, [data]);

  // ── Table ──────────────────────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns: columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }, // Aumentado por ser más compacto
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <section className="space-y-4">
      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryCard
            label="Total Ingresos"
            value={formatGTQ(stats.ingresos)}
            sub={`${data.filter((m) => m.tipo === TipoMovimientoPresupuesto.ASIGNACION_INICIAL).length} movs.`}
            icon={<TrendingUp size={14} className="text-emerald-600" />}
            accent="inflow"
          />
          <SummaryCard
            label="Total Egresos"
            value={formatGTQ(stats.egresos)}
            sub={`${data.filter((m) => m.tipo === TipoMovimientoPresupuesto.COMPROMISO).length} movs.`}
            icon={<TrendingDown size={14} className="text-rose-600" />}
            accent="outflow"
          />
          <SummaryCard
            label="Neto"
            value={formatGTQ(stats.neto)}
            sub={`${stats.totalMovimientos} movs. totales`}
            icon={<Zap size={14} className="text-amber-600" />}
          />
        </div>
      )}

      {/* ── Search / Filter bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            placeholder="Buscar por partida, centro, usuario..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-7 h-7 text-xs border-slate-200 focus-visible:ring-slate-300"
          />
        </div>
        {globalFilter && (
          <Badge
            variant="outline"
            className="text-[10px] text-slate-950 border-slate-300 cursor-pointer hover:bg-slate-100 py-0.5 px-1.5"
            onClick={() => setGlobalFilter("")}
          >
            Limpiar ✕
          </Badge>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-md border border-slate-200 overflow-x-auto">
          <Table>
            <TableHeader className="">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b-slate-200">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-1 px-2.5 first:pl-3 last:pr-3 whitespace-nowrap h-7"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-slate-100 transition-colors "
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-1.5 px-2.5 first:pl-3 last:pr-3 align-top"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-xs text-slate-400"
                  >
                    No se encontraron movimientos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {!isLoading && totalRows > pageSize && (
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Mostrando {from}–{to} de {totalRows}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 border-slate-200 hover:bg-slate-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={13} />
            </Button>
            <span className="px-1.5 tabular-nums font-medium text-slate-700">
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 border-slate-200 hover:bg-slate-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
