"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ArrowUpDown } from "lucide-react";
import { PresupuestoListItem } from "@/Types/costos presupuestales/presupuestos_all";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatGTQ = (amount: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(amount);

/** Returns the % of budget used (ejercido / asignado) */
const usagePercent = (item: PresupuestoListItem) => {
  if (item.montoAsignado === 0) return 0;
  return Math.round((item.montoEjercido / item.montoAsignado) * 100);
};

// ── Column definitions ────────────────────────────────────────────────────────

export const columns: ColumnDef<PresupuestoListItem>[] = [
  // ── 1. Partida ──────────────────────────────────────────────────────────────
  {
    id: "partida",
    accessorFn: (row) => `${row.partida.codigo} ${row.partida.nombre}`,
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-1 text-xs font-semibold  hover:bg-slate-100"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Partida
        <ArrowUpDown size={13} className="text-slate-400" />
      </Button>
    ),
    cell: ({ row }) => {
      const { codigo, nombre } = row.original.partida;
      return (
        <div className="min-w-[160px]">
          <p className="text-xs font-mono font-semibold text-slate-500 leading-none">
            {codigo}
          </p>
          <p className="text-sm font-medium  leading-snug mt-0.5">{nombre}</p>
        </div>
      );
    },
  },

  // ── 2. Centro de Costo ──────────────────────────────────────────────────────
  {
    id: "centroCosto",
    accessorFn: (row) => row.centroCosto.nombre,
    header: () => (
      <span className="text-xs font-semibold ">Centro de Costo</span>
    ),
    cell: ({ row }) => {
      const { codigo, nombre, activo } = row.original.centroCosto;
      return (
        <div className="min-w-[140px]">
          <p className="text-xs font-mono text-slate-500 leading-none">
            {codigo}
          </p>
          <p className="text-sm  leading-snug mt-0.5">{nombre}</p>
          {!activo && (
            <span className="text-[10px] text-slate-400 italic">Inactivo</span>
          )}
        </div>
      );
    },
  },

  // ── 3. Sucursal ─────────────────────────────────────────────────────────────
  {
    accessorKey: "sucursal",
    header: () => <span className="text-xs font-semibold ">Sucursal</span>,
    cell: ({ row }) => (
      <span className="text-sm  whitespace-nowrap">
        {row.original.sucursal}
      </span>
    ),
  },

  // ── 4. Periodo ──────────────────────────────────────────────────────────────
  {
    id: "periodo",
    accessorFn: (row) => row.periodo.nombre,
    header: () => <span className="text-xs font-semibold ">Periodo</span>,
    cell: ({ row }) => {
      const { nombre, estado } = row.original.periodo;
      const isOpen = estado === true;
      return (
        <div className="flex flex-col gap-1 min-w-[110px]">
          <span className="text-sm  whitespace-nowrap">{nombre}</span>
          <Badge
            variant="outline"
            className={`w-fit text-[10px] px-1.5 py-0 leading-5 font-semibold border  ${
              isOpen ? "border-emerald-400 " : "border-slate-300 "
            }`}
          >
            {estado}
          </Badge>
        </div>
      );
    },
  },

  // ── 5. Monto Asignado ───────────────────────────────────────────────────────
  {
    accessorKey: "montoAsignado",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-1 text-xs font-semibold  hover:bg-slate-100 justify-end w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Asignado
        <ArrowUpDown size={13} className="text-slate-400" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums  block text-right">
        {formatGTQ(row.original.montoAsignado)}
      </span>
    ),
  },

  // ── 6. Monto Ejercido ───────────────────────────────────────────────────────
  {
    accessorKey: "montoEjercido",
    header: () => (
      <span className="text-xs font-semibold  block text-right">Ejercido</span>
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums  block text-right">
        {formatGTQ(row.original.montoEjercido)}
      </span>
    ),
  },

  // ── 7. Monto Disponible ─────────────────────────────────────────────────────
  {
    accessorKey: "montoDisponible",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-1 text-xs font-semibold  hover:bg-slate-100 justify-end w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Disponible
        <ArrowUpDown size={13} className="text-slate-400" />
      </Button>
    ),
    cell: ({ row }) => {
      const pct = usagePercent(row.original);
      const available = row.original.montoDisponible;
      const isLow = pct >= 80;
      return (
        <div className="min-w-[120px] text-right">
          <span
            className={`text-sm font-semibold tabular-nums ${
              isLow ? "text-rose-600" : ""
            }`}
          >
            {formatGTQ(available)}
          </span>
          {/* Mini progress bar */}
          <div className="mt-1 h-1 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct >= 80
                  ? "bg-rose-400"
                  : pct >= 60
                    ? "bg-amber-400"
                    : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 tabular-nums">
            {pct}% usado
          </span>
        </div>
      );
    },
  },

  // ── 8. Acciones ─────────────────────────────────────────────────────────────
  {
    id: "acciones",
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-slate-500 hover: hover:bg-slate-100"
        aria-label={`Ver detalles del presupuesto ${row.original.id}`}
        asChild
      >
        {/* In a real app this would be <Link to={`/presupuestos/detalle/${row.original.id}`}> */}
        <a href={`/presupuestos/detalle/${row.original.id}`}>
          <Eye size={15} />
        </a>
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
