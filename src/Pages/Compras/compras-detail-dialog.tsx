"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Calendar,
  CheckCircle2,
  CircleOff,
  ClipboardList,
  ExternalLink,
  FileText,
  Hash,
  Package,
  Receipt,
  User,
} from "lucide-react";
import { CompraEstado, CompraListItem } from "@/Types/compras/interfaces";
import { formatFechaCompra, truncate } from "./columns";
import { formattMonedaGT } from "@/utils/formattMoneda";

// ─── types ────────────────────────────────────────────────────────────────────

interface ComprasDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compra: CompraListItem | null;
  /** Base path to the full purchase detail view. Defaults to "/compras" */
  basePath?: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<
  CompraEstado,
  { label: string; className: string }
> = {
  RECIBIDO: {
    label: "Recibido",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  RECIBIDO_PARCIAL: {
    label: "Parcial",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
  ESPERANDO_ENTREGA: {
    label: "En espera",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  },
  CANCELADO: {
    label: "Cancelado",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-xs text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <span className="text-xs font-medium leading-tight">{children}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "default" | "green";
}) {
  const valueClass =
    accent === "green"
      ? "text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
      : "text-sm font-semibold tabular-nums";

  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md border px-3 py-2 bg-muted/30 flex-1 min-w-0">
      <span className={valueClass}>{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function ComprasDetailDialog({
  open,
  onOpenChange,
  compra,
  basePath = "/compras",
}: ComprasDetailDialogProps) {
  if (!compra) return null;

  const estadoCfg = ESTADO_CONFIG[compra.estado] ?? {
    label: compra.estado,
    className: "bg-muted text-foreground border-border",
  };

  const { date: fechaDate, time: fechaTime } = formatFechaCompra(compra.fecha);
  const { date: creadoDate } = formatFechaCompra(compra.creadoEn);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* ── header ── */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <DialogTitle className="text-sm font-semibold leading-none">
                Compra{" "}
                <span className="font-mono text-muted-foreground">
                  #{compra.id}
                </span>
              </DialogTitle>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0.5 h-auto leading-none ${estadoCfg.className}`}
              >
                {estadoCfg.label}
              </Badge>
            </div>
            <a
              href={`${basePath}/${compra.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Ver completo
            </a>
          </div>
        </DialogHeader>

        <div className="px-4 py-3 space-y-4">
          {/* ── stats ── */}
          <div className="flex gap-2">
            <StatCard label="Items" value={compra.resumen.items} />
            <StatCard
              label="Cantidad total"
              value={compra.resumen.cantidadTotal}
            />
            <StatCard
              label="Total"
              value={formattMonedaGT(compra.total)}
              accent="green"
            />
          </div>

          <Separator />

          {/* ── info general ── */}
          <div>
            <SectionLabel>Información general</SectionLabel>
            <div className="divide-y divide-border/50">
              <InfoRow icon={Calendar} label="Fecha">
                <span className="tabular-nums">
                  {fechaDate}
                  {fechaTime && (
                    <span className="text-muted-foreground ml-1">
                      {fechaTime}
                    </span>
                  )}
                </span>
              </InfoRow>
              <InfoRow icon={User} label="Usuario">
                {compra.usuario.nombre}
                <span className="text-muted-foreground ml-1 font-normal">
                  {compra.usuario.correo}
                </span>
              </InfoRow>
              <InfoRow icon={Building2} label="Proveedor">
                {compra.proveedor?.nombre ?? (
                  <span className="text-muted-foreground italic">
                    Sin proveedor
                  </span>
                )}
              </InfoRow>
              <InfoRow icon={Hash} label="Folio origen">
                <span className="font-mono">{compra.folioOrigen || "—"}</span>
                {compra.tipoOrigen && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 h-auto leading-tight ml-1.5"
                  >
                    {compra.tipoOrigen}
                  </Badge>
                )}
              </InfoRow>
              <InfoRow icon={Receipt} label="Factura">
                {compra.conFactura ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {compra.factura?.numero ? (
                      <span className="font-mono">{compra.factura.numero}</span>
                    ) : (
                      "Con factura"
                    )}
                    {compra.factura?.fecha && (
                      <span className="text-muted-foreground font-normal">
                        · {formatFechaCompra(compra.factura.fecha).date}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground italic">
                    <CircleOff className="h-3 w-3" />
                    Sin factura
                  </span>
                )}
              </InfoRow>
              <InfoRow icon={Calendar} label="Registrado">
                {creadoDate}
              </InfoRow>
            </div>
          </div>

          <Separator />

          {/* ── productos ── */}
          <div>
            <SectionLabel>
              Productos{" "}
              <span className="normal-case font-normal text-muted-foreground">
                ({compra.detalles.length})
              </span>
            </SectionLabel>

            {compra.detalles.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                Sin detalles de productos.
              </p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-2.5 py-1.5 font-medium text-muted-foreground text-[10px]">
                        Producto
                      </th>
                      <th className="text-right px-2.5 py-1.5 font-medium text-muted-foreground text-[10px] tabular-nums">
                        Cant.
                      </th>
                      <th className="text-right px-2.5 py-1.5 font-medium text-muted-foreground text-[10px] tabular-nums hidden sm:table-cell">
                        Costo unit.
                      </th>
                      <th className="text-right px-2.5 py-1.5 font-medium text-muted-foreground text-[10px] tabular-nums">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {compra.detalles.map((det) => (
                      <tr
                        key={det.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-2.5 py-2">
                          <p className="font-medium leading-none">
                            {truncate(det.producto.nombre, 28)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                            {det.producto.codigo}
                          </p>
                          {det.presentacion && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {det.presentacion.nombre}
                            </p>
                          )}
                        </td>
                        <td className="px-2.5 py-2 text-right tabular-nums font-medium">
                          {det.cantidad}
                        </td>
                        <td className="px-2.5 py-2 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                          {formattMonedaGT(det.costoUnitario)}
                        </td>
                        <td className="px-2.5 py-2 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          {formattMonedaGT(det.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/30">
                      <td
                        colSpan={2}
                        className="px-2.5 py-1.5 text-[10px] text-muted-foreground hidden sm:table-cell"
                      />
                      <td className="px-2.5 py-1.5 text-right text-[10px] text-muted-foreground sm:hidden">
                        Total
                      </td>
                      <td
                        colSpan={1}
                        className="px-2.5 py-1.5 text-right text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
                      >
                        {formattMonedaGT(compra.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ── requisición vinculada ── */}
          {compra.requisicion && (
            <>
              <Separator />
              <div>
                <SectionLabel>Requisición vinculada</SectionLabel>
                <div className="divide-y divide-border/50">
                  <InfoRow icon={ClipboardList} label="Folio">
                    <span className="font-mono">
                      {compra.requisicion.folio}
                    </span>
                  </InfoRow>
                  <InfoRow icon={Hash} label="Estado">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 h-auto leading-none"
                    >
                      {compra.requisicion.estado.replace(/_/g, " ")}
                    </Badge>
                  </InfoRow>
                  <InfoRow icon={FileText} label="Líneas">
                    {compra.requisicion.totalLineas}
                  </InfoRow>
                  {compra.requisicion.fecha && (
                    <InfoRow icon={Calendar} label="Fecha">
                      <span className="tabular-nums">
                        {formatFechaCompra(compra.requisicion.fecha).date}
                      </span>
                    </InfoRow>
                  )}
                  <InfoRow icon={User} label="Usuario">
                    {compra.requisicion.usuario.nombre}
                  </InfoRow>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
