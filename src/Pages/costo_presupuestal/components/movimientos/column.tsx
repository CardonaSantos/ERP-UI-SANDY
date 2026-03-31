"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { MovimientoTableRow } from "@/Types/movimientos-presupuestales-table/interfaces";
import { TipoMovimientoPresupuesto } from "@/Types/costos presupuestales/costos_presupuestales";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatGTQ = (amount: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

/**
 * Obtiene la configuración de visualización para un tipo de movimiento presupuestal
 */
function getTipoMovimientoConfig(tipo: TipoMovimientoPresupuesto) {
  const config: Record<
    TipoMovimientoPresupuesto,
    { label: string; color: string }
  > = {
    [TipoMovimientoPresupuesto.ASIGNACION_INICIAL]: {
      label: "Asignación Inicial",
      color: "bg-blue-100 text-blue-700 border-blue-300",
    },
    [TipoMovimientoPresupuesto.COMPROMISO]: {
      label: "Compromiso",
      color: "bg-amber-100 text-amber-700 border-amber-300",
    },
    [TipoMovimientoPresupuesto.EJERCICIO]: {
      label: "Ejercicio",
      color: "bg-rose-100 text-rose-700 border-rose-300",
    },
    [TipoMovimientoPresupuesto.LIBERACION_COMPROMISO]: {
      label: "Lib. Compromiso", // Texto acortado
      color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    },
    [TipoMovimientoPresupuesto.LIBERACION_EJERCICIO]: {
      label: "Lib. Ejercicio", // Texto acortado
      color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    },
    [TipoMovimientoPresupuesto.AJUSTE_MANUAL]: {
      label: "Ajuste Manual",
      color: "bg-purple-100 text-purple-700 border-purple-300",
    },
  };

  return config[tipo];
}

// ── Column definitions ────────────────────────────────────────────────────────

export const columns: ColumnDef<MovimientoTableRow>[] = [
  // ── 1. Fecha ────────────────────────────────────────────────────────────────
  {
    id: "fecha",
    accessorFn: (row) => row.fecha,
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 gap-1 px-1 text-[11px] font-semibold "
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown size={12} className="text-slate-400" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-medium tabular-nums">
        {formatDate(row.original.fecha)}
      </span>
    ),
  },

  // ── 2. Tipo de Movimiento ──────────────────────────────────────────────────
  {
    id: "tipo",
    accessorFn: (row) => row.tipo,
    header: () => <span className="text-[11px] font-semibold">Tipo</span>,
    cell: ({ row }) => {
      const tipo = row.original.tipo;
      const config = getTipoMovimientoConfig(tipo);

      return (
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 leading-tight font-semibold border ${config.color}`}
        >
          {config.label}
        </Badge>
      );
    },
  },

  // ── 3. Partida ──────────────────────────────────────────────────────────────
  {
    id: "partida",
    accessorFn: (row) => `${row.partida.codigo} ${row.partida.nombre}`,
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 gap-1 px-1 text-[11px] font-semibold "
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Partida
        <ArrowUpDown size={12} className="text-slate-400" />
      </Button>
    ),
    cell: ({ row }) => {
      const { codigo, nombre } = row.original.partida;
      return (
        <div className="min-w-[140px]">
          <p className="text-[10px] font-mono font-semibold text-slate-500 leading-none">
            {codigo}
          </p>
          <p className="text-xs font-medium leading-tight mt-0.5">{nombre}</p>
        </div>
      );
    },
  },

  // ── 4. Centro de Costo ──────────────────────────────────────────────────────
  {
    id: "centroCosto",
    accessorFn: (row) => row.centroCosto.nombre,
    header: () => (
      <span className="text-[11px] font-semibold">Centro de Costo</span>
    ),
    cell: ({ row }) => {
      const { codigo, nombre } = row.original.centroCosto;
      return (
        <div className="min-w-[120px]">
          <p className="text-[10px] font-mono text-slate-500 leading-none">
            {codigo || "—"}
          </p>
          <p className="text-xs leading-tight mt-0.5">{nombre}</p>
        </div>
      );
    },
  },

  // ── 5. Periodo ──────────────────────────────────────────────────────────────
  {
    id: "periodo",
    accessorFn: (row) => row.periodo.nombre,
    header: () => <span className="text-[11px] font-semibold">Periodo</span>,
    cell: ({ row }) => (
      <span className="text-xs whitespace-nowrap">
        {row.original.periodo.nombre}
      </span>
    ),
  },

  // ── 6. Monto ────────────────────────────────────────────────────────────────
  {
    accessorKey: "monto",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 gap-1 px-1 text-[11px] font-semibold  justify-end w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Monto
        <ArrowUpDown size={12} className="text-slate-400" />
      </Button>
    ),
    cell: ({ row }) => {
      const monto = row.original.monto;
      const tipo = row.original.tipo;

      const isNegative =
        tipo === TipoMovimientoPresupuesto.EJERCICIO ||
        tipo === TipoMovimientoPresupuesto.COMPROMISO ||
        tipo === TipoMovimientoPresupuesto.LIBERACION_COMPROMISO ||
        tipo === TipoMovimientoPresupuesto.LIBERACION_EJERCICIO;

      const isPositive = tipo === TipoMovimientoPresupuesto.ASIGNACION_INICIAL;

      let colorClass = "text-slate-600";
      if (isNegative) colorClass = "text-rose-600";
      else if (isPositive) colorClass = "text-emerald-600";

      return (
        <span
          className={`text-xs font-semibold tabular-nums block text-right ${colorClass}`}
        >
          {isNegative ? "-" : isPositive ? "+" : ""}
          {formatGTQ(Math.abs(monto))}
        </span>
      );
    },
  },

  // ── 7. Descripción ──────────────────────────────────────────────────────────
  {
    accessorKey: "descripcion",
    header: () => (
      <span className="text-[11px] font-semibold">Descripción</span>
    ),
    cell: ({ row }) => {
      const desc = row.original.descripcion;
      return (
        <span className="text-xs text-slate-600 line-clamp-2 max-w-[200px] leading-tight">
          {desc || "—"}
        </span>
      );
    },
  },

  // ── 8. Origen ───────────────────────────────────────────────────────────────
  {
    id: "origen",
    accessorFn: (row) => row.origen.tipo,
    header: () => <span className="text-[11px] font-semibold">Origen</span>,
    cell: ({ row }) => {
      const { tipo, referencia } = row.original.origen;

      if (!tipo) {
        return <span className="text-slate-400 text-xs">—</span>;
      }

      const origenConfig = {
        requisicion: { label: "Req", color: "bg-purple-100 text-purple-700" },
        compra: { label: "OC", color: "bg-indigo-100 text-indigo-700" },
        manual: { label: "Manual", color: "bg-slate-100 text-slate-700" },
      };

      const config = origenConfig[tipo as keyof typeof origenConfig];

      return (
        <Badge
          variant="outline"
          className={`text-[9px] px-1.5 py-0 leading-tight ${config.color}`}
        >
          {config.label} {referencia && `#${referencia}`}
        </Badge>
      );
    },
  },

  // ── 9. Usuario ──────────────────────────────────────────────────────────────
  {
    accessorKey: "usuario",
    header: () => <span className="text-[11px] font-semibold">Usuario</span>,
    cell: ({ row }) => (
      <span className="text-xs text-slate-600">{row.original.usuario}</span>
    ),
  },
];
