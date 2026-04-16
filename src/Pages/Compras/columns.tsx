"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUpDown,
  Building2,
  Calendar,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  Package,
  User,
} from "lucide-react";
import { CompraEstado, CompraListItem } from "@/Types/compras/interfaces";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { Link } from "react-router-dom";

export function formatFechaCompra(iso: string | null): {
  date: string;
  time: string;
} {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "—", time: "" };

  const z = (n: number) => String(n).padStart(2, "0");

  const day = z(d.getDate());
  const month = z(d.getMonth() + 1);
  const year = String(d.getFullYear()).slice(-2);

  const hours = d.getHours();
  const minutes = z(d.getMinutes());
  const ampm = hours >= 12 ? "pm" : "am";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;

  return {
    date: `${day}/${month}/${year}`,
    time: `${h12}:${minutes} ${ampm}`,
  };
}

export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

const ESTADO_CONFIG: Record<
  CompraEstado,
  { label: string; className: string }
> = {
  RECIBIDO: {
    label: "Recibido",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  RECIBIDO_PARCIAL: {
    label: "Parcial",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  },
  ESPERANDO_ENTREGA: {
    label: "Pendiente",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  },
  CANCELADO: {
    label: "Cancelado",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  },
};

export function EstadoBadge({ estado }: { estado: CompraEstado }) {
  const cfg = ESTADO_CONFIG[estado] ?? {
    label: estado.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

export function TipoOrigenBadge({ tipo }: { tipo: string }) {
  const isRequisicion = tipo === "REQUISICION";
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none ${
        isRequisicion
          ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800"
          : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800"
      }`}
    >
      {tipo.replace(/_/g, " ")}
    </span>
  );
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onOpenDetalle?: (row: TData) => void;
  }
}

const ch = createColumnHelper<CompraListItem>();

function SortableHeader({
  label,
  icon: Icon,
  column,
}: {
  label: string;
  icon?: React.ElementType;
  column: {
    toggleSorting: (asc: boolean) => void;
    getIsSorted: () => false | "asc" | "desc";
  };
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors select-none"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
      <ArrowUpDown className="h-2.5 w-2.5 opacity-50" />
    </button>
  );
}

export const comprasColumns: ColumnDef<CompraListItem, any>[] = [
  ch.accessor("id", {
    header: ({ column }) => (
      <SortableHeader label="ID" icon={Hash} column={column} />
    ),
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        #{info.getValue()}
      </span>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 56,
  }),

  ch.accessor("fecha", {
    header: ({ column }) => (
      <SortableHeader label="Fecha" icon={Calendar} column={column} />
    ),
    cell: (info) => {
      const { date, time } = formatFechaCompra(info.getValue<string | null>());
      if (date === "—")
        return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <div className="flex flex-col leading-none gap-0.5">
          <span className="text-xs font-medium tabular-nums">{date}</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {time}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    size: 80,
  }),

  ch.accessor("usuario.nombre", {
    header: ({ column }) => (
      <SortableHeader label="Usuario" icon={User} column={column} />
    ),
    cell: (info) => (
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-2.5 w-2.5 text-muted-foreground" />
        </div>
        <span className="text-xs truncate">
          {truncate(info.getValue<string>() || "—", 14)}
        </span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 130,
  }),

  ch.accessor((row) => row.proveedor?.nombre ?? null, {
    id: "proveedor",
    header: ({ column }) => (
      <SortableHeader label="Proveedor" icon={Building2} column={column} />
    ),
    cell: (info) => {
      const val = info.getValue<string | null>();
      return val ? (
        <span className="text-xs">{truncate(val, 18)}</span>
      ) : (
        <span className="text-xs text-muted-foreground italic">
          Sin proveedor
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    size: 140,
  }),

  ch.accessor("folioOrigen", {
    header: ({ column }) => (
      <SortableHeader label="Folio" icon={FileText} column={column} />
    ),
    cell: (info) => {
      const val = info.getValue<string>();
      const tipo = info.row.original.tipoOrigen;
      return val ? (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs font-medium">{val}</span>
          <TipoOrigenBadge tipo={tipo} />
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    size: 110,
  }),

  ch.accessor("total", {
    header: ({ column }) => (
      <SortableHeader label="Total" icon={DollarSign} column={column} />
    ),
    cell: (info) => (
      <span className="font-mono text-xs font-semibold tabular-nums">
        {formattMonedaGT(info.getValue<number>())}
      </span>
    ),
    enableSorting: true,
    size: 100,
  }),

  ch.accessor("resumen.items", {
    header: ({ column }) => (
      <SortableHeader label="Items" icon={Package} column={column} />
    ),
    cell: (info) => {
      const cant = info.row.original.resumen.cantidadTotal;
      return (
        <div className="flex flex-col leading-none gap-0.5">
          <span className="text-xs font-medium tabular-nums">
            {info.getValue()} líneas
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {cant} u.
          </span>
        </div>
      );
    },
    enableSorting: true,
    size: 80,
  }),

  ch.accessor("estado", {
    header: () => (
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        Estado
      </span>
    ),
    cell: (info) => <EstadoBadge estado={info.getValue<CompraEstado>()} />,
    enableSorting: true,
    enableColumnFilter: true,
    size: 90,
  }),

  ch.display({
    id: "acciones",
    header: () => (
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        Acciones
      </span>
    ),
    cell: (info) => {
      const compra = info.row.original;
      return (
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={`/compra/${compra.id}`}
                  className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={`Ver compra #${compra.id}`}
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Ver compra completa
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Revisión rápida */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    info.table.options.meta?.onOpenDetalle?.(compra)
                  }
                  aria-label="Vista rápida"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Vista rápida
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    size: 72,
  }),
];
