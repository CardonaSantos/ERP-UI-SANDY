"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  PackageOpen,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
import type { CompraResumenUI } from "./interfaces/recepcionesInterfaces";

// ---- stub formatters (replace with real ones) ----
const fmt = (d?: string) =>
  d
    ? new Date(d).toLocaleString("es-GT", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";
const fmtM = (n?: number) =>
  n != null
    ? `Q${Number(n).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`
    : "—";

interface Props {
  compra: CompraResumenUI;
}

export default function CardCompraMain({ compra }: Props) {
  const { id, fecha, estado, origen, conFactura, total, usuario, totales } =
    compra;
  const pct =
    totales.unidadesOrdenadas > 0
      ? Math.min(
          100,
          Math.round(
            (totales.unidadesRecibidas / totales.unidadesOrdenadas) * 100,
          ),
        )
      : 0;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold">Compra #{id}</span>
          <EstadoBadge estado={estado} />
          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-xs">
            <Truck className="h-3 w-3" />
            {origen}
          </Badge>
          <Badge
            variant={conFactura ? "secondary" : "outline"}
            className="h-5 gap-1 px-1.5 text-xs"
          >
            <FileText className="h-3 w-3" />
            {conFactura ? "Con factura" : "Sin factura"}
          </Badge>
          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-xs">
            <CalendarDays className="h-3 w-3" />
            {fmt(fecha)}
          </Badge>
          <Badge variant="outline" className="h-5 gap-1 px-1.5 text-xs">
            <UserRound className="h-3 w-3" />
            {usuario?.nombre ?? "—"}
          </Badge>
        </div>

        {/* Total */}
        <div className="flex items-center gap-1 text-sm font-semibold">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{fmtM(total)}</span>
        </div>
      </div>

      <Separator />

      {/* KPIs + progress */}
      <div className="px-4 py-3 space-y-3">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Avance de recepción
            </span>
            <span>
              {totales.unidadesRecibidas}/{totales.unidadesOrdenadas} unid. ·{" "}
              {pct}%
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <Stat
            icon={<ClipboardList className="h-3.5 w-3.5" />}
            label="Líneas"
            value={totales.lineasOrdenadas}
          />
          <Stat
            icon={<PackageOpen className="h-3.5 w-3.5" />}
            label="Ordenadas"
            value={totales.unidadesOrdenadas}
          />
          <Stat
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Recibidas"
            value={totales.unidadesRecibidas}
          />
          <Stat
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            label="Pendientes"
            value={totales.unidadesPendientes}
            warn={totales.unidadesPendientes > 0}
          />
          <Stat
            icon={<Truck className="h-3.5 w-3.5" />}
            label="Recepciones"
            value={totales.recepcionesCount}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */

function EstadoBadge({ estado }: { estado: string }) {
  type Cfg = {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  };
  const map: Record<string, Cfg> = {
    RECIBIDO: {
      label: "Recibido",
      variant: "default",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    ESPERANDO_ENTREGA: {
      label: "Esperando entrega",
      variant: "secondary",
      icon: <Truck className="h-3 w-3" />,
    },
    PARCIAL: {
      label: "Parcial",
      variant: "secondary",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    ANULADO: {
      label: "Anulado",
      variant: "destructive",
      icon: <XCircle className="h-3 w-3" />,
    },
  };
  const cfg = map[estado] ?? {
    label: estado,
    variant: "outline" as const,
    icon: <ClipboardList className="h-3 w-3" />,
  };
  return (
    <Badge variant={cfg.variant} className="h-5 gap-1 px-1.5 text-xs">
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

function Stat({
  icon,
  label,
  value,
  warn = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  warn?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-md border px-2 py-1.5",
        warn
          ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
          : "bg-muted/30",
      ].join(" ")}
    >
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold leading-tight">{value}</div>
    </div>
  );
}
