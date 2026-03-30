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
  LayoutDashboard,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  ShieldAlert,
} from "lucide-react";
import { PresupuestoListItem } from "@/Types/costos presupuestales/presupuestos_all";
import { columns } from "./table/columns";
import { Link } from "react-router-dom";
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
  accent?: "default" | "warn" | "danger";
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
  accent = "default",
}: SummaryCardProps) {
  const accentBg = {
    default: " border-slate-200",
    warn: " border-amber-200",
    danger: " border-rose-200",
  }[accent];
  const accentIcon = {
    default: "",
    warn: "",
    danger: "",
  }[accent];

  return (
    <article
      className={`rounded-lg border p-4 flex items-start gap-3 ${accentBg}`}
    >
      <span className={`mt-0.5 shrink-0 ${accentIcon}`}>{icon}</span>
      <div>
        <p className="text-xs  font-medium leading-none">{label}</p>
        <p className="text-base font-semibold  mt-1 tabular-nums">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </article>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded" />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  data: PresupuestoListItem[];
  isLoading: boolean;
}

export function PresupuestosDashboard({ data, isLoading }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalAsignado = data.reduce((s, r) => s + r.montoAsignado, 0);
    const totalEjercido = data.reduce((s, r) => s + r.montoEjercido, 0);
    const totalDisponible = data.reduce((s, r) => s + r.montoDisponible, 0);
    const pctUsado =
      totalAsignado > 0 ? (totalEjercido / totalAsignado) * 100 : 0;
    const criticos = data.filter(
      (r) => r.montoAsignado > 0 && r.montoEjercido / r.montoAsignado >= 0.8,
    ).length;
    return {
      totalAsignado,
      totalEjercido,
      totalDisponible,
      pctUsado,
      criticos,
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
    initialState: { pagination: { pageSize: 10 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <section className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={18} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.length} registro{data.length !== 1 ? "s" : ""} en total
            </p>
          </div>
        </div>

        <Link to={`/crear-presupuesto`}>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium  text-white"
          >
            <Plus size={14} />
            Nueva Asignación
          </Button>
        </Link>
      </header>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Total Asignado"
            value={formatGTQ(stats.totalAsignado)}
            sub={`${data.length} partidas activas`}
            icon={<Wallet size={16} />}
          />
          <SummaryCard
            label="Total Ejercido"
            value={formatGTQ(stats.totalEjercido)}
            sub={`${stats.pctUsado.toFixed(1)}% del presupuesto`}
            icon={<TrendingUp size={16} />}
            accent={
              stats.pctUsado >= 80
                ? "danger"
                : stats.pctUsado >= 60
                  ? "warn"
                  : "default"
            }
          />
          <SummaryCard
            label="Total Disponible"
            value={formatGTQ(stats.totalDisponible)}
            icon={<Wallet size={16} />}
          />
          <SummaryCard
            label="Partidas Críticas"
            value={String(stats.criticos)}
            sub="Uso ≥ 80% del asignado"
            icon={<ShieldAlert size={16} />}
            accent={stats.criticos > 0 ? "danger" : "default"}
          />
        </div>
      )}

      {/* ── Search / Filter bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            placeholder="Buscar partida, centro de costo, sucursal…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 h-8 text-sm border-slate-200 focus-visible:ring-slate-300"
          />
        </div>
        {globalFilter && (
          <Badge
            variant="outline"
            className="text-xs text-slate-950 border-slate-300 cursor-pointer hover:bg-slate-100"
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
        <div className="rounded-lg border border-slate-200 overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-2 px-3 first:pl-4 last:pr-4 whitespace-nowrap"
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
                    className="border-b border-slate-100  transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2.5 px-3 first:pl-4 last:pr-4 align-top"
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
                    className="h-32 text-center text-sm "
                  >
                    No se encontraron presupuestos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {!isLoading && totalRows > pageSize && (
        <div className="flex items-center justify-between text-xs ">
          <span>
            Mostrando {from}–{to} de {totalRows} registros
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 border-slate-200 hover:bg-slate-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Página anterior"
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="px-2 tabular-nums text-slate-950 font-medium">
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 border-slate-200 hover:bg-slate-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Página siguiente"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
