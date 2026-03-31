"use client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  Building2,
  Layers,
  MapPin,
  Wallet,
  TrendingUp,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  PenLine,
  Clock,
  User,
  Hash,
  FileText,
} from "lucide-react";
import {
  EstadoPeriodo,
  PresupuestoDetalleView,
  TipoMovimientoPresupuesto,
} from "@/Types/costos presupuestales/costos_presupuestales";
import { PageTransition } from "@/components/Transition/layout-transition";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import DynamicEntityForm from "../../dynamictEntityForm/dynamicForm";
import { usePresupuestoAjuste } from "@/hooks/use-costos-presupuestales/main-posts";
import {
  presupuestoAjuste,
  presupuestoSchemaAjuste,
} from "../../schemas/form-schemas";
import { Label } from "@/components/ui/label";
import { AdvancedDialogERP } from "@/utils/components/dialog/advanced-dialog";
import { toast } from "sonner";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";
import { PresupuestoAjusteDto } from "@/hooks/use-costos-presupuestales/mutations";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatGTQ = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(n);

const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(d));

const formatShortDate = (d: string | Date) =>
  new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

// ── Tipo movimiento config ────────────────────────────────────────────────────

interface TipoConfig {
  label: string;
  icon: React.ReactNode;
  badgeCls: string;
  amountCls: string;
  sign: "+" | "-";
}

const TIPO_CONFIG: Record<TipoMovimientoPresupuesto, TipoConfig> = {
  [TipoMovimientoPresupuesto.ASIGNACION_INICIAL]: {
    label: "Asignación Inicial",
    icon: <CheckCircle2 size={14} />,
    badgeCls: "border-emerald-300 bg-emerald-50 text-emerald-800",
    amountCls: "text-emerald-700",
    sign: "+",
  },
  [TipoMovimientoPresupuesto.COMPROMISO]: {
    label: "Compromiso",
    icon: <Lock size={14} />,
    badgeCls: "border-amber-300 bg-amber-50 text-amber-800",
    amountCls: "text-amber-700",
    sign: "-",
  },
  [TipoMovimientoPresupuesto.EJERCICIO]: {
    label: "Ejercicio",
    icon: <TrendingUp size={14} />,
    badgeCls: "border-rose-300 bg-rose-50 text-rose-800",
    amountCls: "text-rose-700",
    sign: "-",
  },
  [TipoMovimientoPresupuesto.LIBERACION_COMPROMISO]: {
    label: "Liberación Compromiso",
    icon: <ArrowUpCircle size={14} />,
    badgeCls: "border-sky-300 bg-sky-50 text-sky-800",
    amountCls: "text-sky-700",
    sign: "+",
  },
  [TipoMovimientoPresupuesto.LIBERACION_EJERCICIO]: {
    label: "Liberación Ejercicio",
    icon: <ArrowDownCircle size={14} />,
    badgeCls: "border-violet-300 bg-violet-50 text-violet-800",
    amountCls: "text-violet-700",
    sign: "+",
  },
  [TipoMovimientoPresupuesto.AJUSTE_MANUAL]: {
    label: "Ajuste Manual",
    icon: <PenLine size={14} />,
    badgeCls: "border-slate-300 bg-slate-50 text-slate-700",
    amountCls: "text-slate-700",
    sign: "+",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface MetaItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function MetaItem({ icon, label, value }: MetaItemProps) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400 shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] text-slate-400 font-medium leading-none uppercase tracking-wide">
          {label}
        </p>
        <div className="text-sm font-medium mt-0.5 leading-snug">{value}</div>
      </div>
    </div>
  );
}

interface AmountCardProps {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  variant?: "default" | "warn" | "danger" | "info";
}

function AmountCard({
  label,
  value,
  sub,
  icon,
  variant = "default",
}: AmountCardProps) {
  const cls = {
    default: " border-slate-200",
    warn: " border-amber-200",
    danger: " border-rose-200",
    info: " border-sky-200",
  }[variant];
  const iconCls = {
    default: "",
    warn: "",
    danger: "",
    info: "",
  }[variant];

  return (
    <article
      className={`rounded-lg border p-3.5 flex items-start gap-3 ${cls}`}
    >
      <span className={`mt-0.5 shrink-0 ${iconCls}`}>{icon}</span>
      <div>
        <p className="text-[11px] font-medium  leading-none uppercase tracking-wide">
          {label}
        </p>
        <p className="text-base font-semibold  mt-1 tabular-nums">
          {formatGTQ(value)}
        </p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-52 rounded-lg" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  data: PresupuestoDetalleView;
  isLoading: boolean;
  onBack?: () => void;
}

export function PresupuestoDetalle({ data, isLoading }: Props) {
  if (isLoading) return <DetailSkeleton />;

  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const mutation = usePresupuestoAjuste(data.id);
  const [formData, setFormData] = useState<PresupuestoAjusteDto | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const pct =
    data.montoAsignado > 0
      ? Math.round((data.montoEjercido / data.montoAsignado) * 100)
      : 0;

  const pctComprometido =
    data.montoAsignado > 0
      ? Math.round((data.montoComprometido / data.montoAsignado) * 100)
      : 0;

  const periodoAbierto = data.periodo.estado === EstadoPeriodo.ABIERTO;
  console.log("El registro de presupuesto es: ", data);
  const [openForm, setOpenForm] = useState<boolean>(false);

  const handleSubmitUpdate = async () => {
    if (!formData) return;

    try {
      await toast.promise(mutation.mutateAsync(formData), {
        loading: "Aplicando ajuste...",
        success: "Presupuesto actualizado",
        error: "Error al actualizar",
      });

      setOpenConfirm(false);
      setOpenForm(false);
    } catch (error) {
      console.log(getApiErrorMessageAxios(error));
    }
  };

  return (
    <PageTransition
      titleHeader="Presupuesto Detalles"
      fallbackBackTo="/"
      className="space-y-3"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2">
          <div>
            <p className="text-xs text-slate-400 mt-1">
              <span className="font-mono font-semibold text-slate-500">
                #{data.id}
              </span>
              {" · "}
              {data.periodo.nombre}
              {" · "}
              {data.sucursal}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {periodoAbierto && (
              <Button
                onClick={() => {
                  const nextState = !openForm;
                  setOpenForm(nextState);

                  if (nextState) {
                    setTimeout(() => scrollToForm(), 100);
                  }
                }}
                size="sm"
                variant="default"
                className="h-7 px-2 text-[11px] gap-1.5 shadow-sm"
              >
                <PenLine size={12} />
                Ajustar presupuesto
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Montos summary ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AmountCard
          label="Asignado"
          value={data.montoAsignado}
          sub="Presupuesto total"
          icon={<Wallet size={16} />}
        />
        <AmountCard
          label="Comprometido"
          value={data.montoComprometido}
          sub={`${pctComprometido}% del total`}
          icon={<Lock size={16} />}
          variant={pctComprometido > 30 ? "warn" : "default"}
        />
        <AmountCard
          label="Ejercido"
          value={data.montoEjercido}
          sub={`${pct}% del total`}
          icon={<TrendingUp size={16} />}
          variant={pct >= 80 ? "danger" : pct >= 60 ? "warn" : "default"}
        />
        <AmountCard
          label="Disponible"
          value={data.montoDisponible}
          sub={`${100 - pct - pctComprometido}% libre`}
          icon={<AlertCircle size={16} />}
          variant={pct >= 80 ? "danger" : "info"}
        />
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-slate-200  p-4 space-y-2">
        <div className="flex items-center justify-between text-xs ">
          <span className="font-medium">Uso del presupuesto</span>
          <span className="tabular-nums font-semibold ">{pct}% ejercido</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
          {/* Ejercido */}
          <div
            className={`h-full transition-all ${
              pct >= 80
                ? "bg-rose-400"
                : pct >= 60
                  ? "bg-amber-400"
                  : "bg-emerald-400"
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
          {/* Comprometido */}
          {pctComprometido > 0 && (
            <div
              className="h-full bg-amber-300 transition-all"
              style={{ width: `${Math.min(pctComprometido, 100 - pct)}%` }}
            />
          )}
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Ejercido ({pct}%)
          </span>
          {pctComprometido > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-300" />
              Comprometido ({pctComprometido}%)
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-200" />
            Disponible
          </span>
        </div>
      </div>

      {/* ── Información general ────────────────────────────────────────────── */}
      <div className="rounded-lg border border-slate-200  p-4">
        <h3 className="text-xs font-semibold  uppercase tracking-wide mb-4">
          Información General
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetaItem
            icon={<Layers size={15} />}
            label="Partida"
            value={
              <span>
                <span className="font-mono text-xs text-slate-500 mr-1">
                  {data.partida.codigo}
                </span>
                {data.partida.nombre}
              </span>
            }
          />
          {data.partida.descripcion && (
            <MetaItem
              icon={<FileText size={15} />}
              label="Descripción"
              value={
                <span className="text-slate-600 font-normal">
                  {data.partida.descripcion}
                </span>
              }
            />
          )}
          <MetaItem
            icon={<Building2 size={15} />}
            label="Centro de Costo"
            value={
              <span>
                <span className="font-mono text-xs text-slate-500 mr-1">
                  {data.centroCosto.codigo}
                </span>
                {data.centroCosto.nombre}
              </span>
            }
          />
          <MetaItem
            icon={<MapPin size={15} />}
            label="Sucursal"
            value={data.sucursal}
          />
          <MetaItem
            icon={<CalendarDays size={15} />}
            label="Periodo"
            value={
              <span className="flex items-center gap-1.5 flex-wrap">
                {data.periodo.nombre}
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 leading-5 font-semibold ${
                    periodoAbierto
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-slate-300 bg-slate-100 text-slate-700"
                  }`}
                >
                  {periodoAbierto ? "ABIERTO" : "CERRADO"}
                </Badge>
              </span>
            }
          />
          <MetaItem
            icon={<CalendarDays size={15} />}
            label="Vigencia"
            value={
              <span className="text-slate-600 font-normal">
                {formatShortDate(data.periodo.fechaInicio)} —{" "}
                {formatShortDate(data.periodo.fechaFin)}
              </span>
            }
          />
        </div>
      </div>

      {/* ── Historial de movimientos ────────────────────────────────────────── */}
      <div className="rounded-lg border border-slate-200 ">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-semibold  uppercase tracking-wide">
            Historial de Movimientos
          </h3>
          <span className="text-[11px]  tabular-nums">
            {data.historial.length} movimiento
            {data.historial.length !== 1 ? "s" : ""}
          </span>
        </div>

        {data.historial.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Sin movimientos registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className=" border-b border-slate-200 hover:bg-slate-50">
                  <TableHead className="py-2 px-3 first:pl-4 whitespace-nowrap">
                    <span className="text-xs font-semibold ">Tipo</span>
                  </TableHead>
                  <TableHead className="py-2 px-3 whitespace-nowrap">
                    <span className="text-xs font-semibold ">Referencia</span>
                  </TableHead>
                  <TableHead className="py-2 px-3 whitespace-nowrap">
                    <span className="text-xs font-semibold ">Descripción</span>
                  </TableHead>
                  <TableHead className="py-2 px-3 text-right whitespace-nowrap">
                    <span className="text-xs font-semibold ">Monto</span>
                  </TableHead>
                  <TableHead className="py-2 px-3 whitespace-nowrap">
                    <span className="text-xs font-semibold ">Usuario</span>
                  </TableHead>
                  <TableHead className="py-2 px-3 last:pr-4 whitespace-nowrap">
                    <span className="text-xs font-semibold ">Fecha</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.historial.map((mov) => {
                  const cfg =
                    TIPO_CONFIG[mov.tipo] ??
                    TIPO_CONFIG[TipoMovimientoPresupuesto.AJUSTE_MANUAL];
                  return (
                    <TableRow
                      key={mov.id}
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Tipo */}
                      <TableCell className="py-2.5 px-3 first:pl-4 align-middle">
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0 leading-5 font-semibold border whitespace-nowrap ${cfg.badgeCls}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </Badge>
                      </TableCell>

                      {/* Referencia */}
                      <TableCell className="py-2.5 px-3 align-middle">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-600 whitespace-nowrap">
                          <Hash size={11} className="text-slate-400" />
                          {mov.referencia}
                        </span>
                      </TableCell>

                      {/* Descripción */}
                      <TableCell className="py-2.5 px-3 align-middle max-w-[220px]">
                        <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                          {mov.descripcion ?? "—"}
                        </p>
                      </TableCell>

                      {/* Monto */}
                      <TableCell className="py-2.5 px-3 text-right align-middle">
                        <span
                          className={`text-sm font-semibold tabular-nums whitespace-nowrap ${cfg.amountCls}`}
                        >
                          {cfg.sign}
                          {formatGTQ(mov.monto)}
                        </span>
                      </TableCell>

                      {/* Usuario */}
                      <TableCell className="py-2.5 px-3 align-middle">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                          <User size={12} className="text-slate-400 shrink-0" />
                          {mov.usuario.trim()}
                        </span>
                      </TableCell>

                      {/* Fecha */}
                      <TableCell className="py-2.5 px-3 last:pr-4 align-middle">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                          <Clock
                            size={12}
                            className="text-slate-400 shrink-0"
                          />
                          {formatDate(mov.fecha)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {openForm && (
        <div ref={containerRef} className="scroll-mt-10 mt-6 border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-1 bg-slate-950 rounded-full" />
            <Label className="text-xs font-bold uppercase tracking-wider">
              Configuración de Ajuste
            </Label>
          </div>

          <div className="px-4">
            <DynamicEntityForm
              mutationHook={() => mutation}
              validationSchema={presupuestoSchemaAjuste}
              config={presupuestoAjuste}
              onSubmitExternal={(data) => {
                setFormData(data);
                setOpenConfirm(true);
              }}
            />
          </div>
        </div>
      )}
      <AdvancedDialogERP
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Confirmar Ajuste Presupuestal"
        description="Estás a punto de modificar el monto asignado a esta partida. Este cambio actualizará inmediatamente el saldo disponible."
        type="warning"
        question="¿Estás seguro de que deseas aplicar esta modificación?"
        confirmButton={{
          label: "Sí, aplicar ajuste",
          onClick: handleSubmitUpdate,
          loading: mutation.isPending,
          disabled: mutation.isPending,
        }}
        cancelButton={{
          onClick: () => {
            setOpenConfirm(false);
          },
          label: "Cancelar",
          disabled: mutation.isPending,
        }}
      />
    </PageTransition>
  );
}
