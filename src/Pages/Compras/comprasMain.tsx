import React from "react";

import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  User,
  Building2,
  DollarSign,
  ShoppingCart,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  FileText,
  Truck,
  ClipboardList,
  Mail,
  MapPin,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { formattFechaWithMinutes } from "../Utils/Utils";
import { EstadoCompra } from "./API/interfaceQuery";
import { formattMonedaGT } from "@/utils/formattMoneda";
import {
  ItemDetallesPayloadParcial,
  PayloadRecepcionParcial,
} from "./table-select-recepcion/selectedItems";
import TableRecepcionCompraSelect from "./table-select-recepcion/table-recepcion-compra-select";
import CardSummary from "./ResumenRecepcionParcial/CardSummary/CardSummary";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { CompraRecepcionableResponse } from "./ResumenRecepcionParcial/Interfaces/detalleRecepcionable";
import { normalizarDetalles } from "./Credito/helpers/normalizador";
import {
  CompraPedidoUI,
  CompraRegistroUI,
  CompraRequisicionUI,
} from "@/Types/compras/interfaces";

// ─── Animaciones ────────────────────────────────────────────────────────────
const fade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

// ─── Estado badge config ─────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<
  EstadoCompra,
  {
    variant: "default" | "secondary" | "outline" | "destructive";
    icon: React.ElementType;
    label: string;
  }
> = {
  RECIBIDO: { variant: "default", icon: CheckCircle, label: "Recibido" },
  CANCELADO: { variant: "destructive", icon: XCircle, label: "Cancelado" },
  RECIBIDO_PARCIAL: {
    variant: "secondary",
    icon: AlertCircle,
    label: "Parcial",
  },
  ESPERANDO_ENTREGA: {
    variant: "outline",
    icon: Truck,
    label: "En camino",
  },
};

type RecepcionFlow = "NORMAL" | "PARCIAL";

interface PropsPage {
  registro: CompraRegistroUI | undefined;
  selectedItems: PayloadRecepcionParcial;
  setSelectedItems: React.Dispatch<
    React.SetStateAction<PayloadRecepcionParcial>
  >;
  isRecibirParcial: boolean;
  setIsRecibirParcial: React.Dispatch<React.SetStateAction<boolean>>;
  isPendingDrp: boolean;
  reFetchDRP: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<CompraRecepcionableResponse, Error>>;
  updateCantidadDetalle: (
    compraDetalleId: number,
    nuevaCantidad: number,
  ) => void;
  upsserSelectItems: (
    item: ItemDetallesPayloadParcial,
    checked: boolean,
  ) => void;
  selectedIds: Set<number>;
  setOpenFormDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openFormDialog: boolean;
  setOpenRecibirParcial: React.Dispatch<React.SetStateAction<boolean>>;
  openRecibirParcial: boolean;
  recepcionable: CompraRecepcionableResponse;
  setOpenFormPaymentDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openFormPaymentDialog: boolean;
  onOpenPaymentFor: (flow: RecepcionFlow) => void;
  updateFechaVencimiento: (
    compraDetalleId: number,
    nuevaFechaVencimiento: string,
  ) => void;
  hasCredit: boolean;
}

// ─── Componente principal ───────────────────────────────────────────────────
function ComprasMain({
  registro,
  selectedItems,
  isRecibirParcial,
  setIsRecibirParcial,
  isPendingDrp,
  reFetchDRP,
  updateCantidadDetalle,
  upsserSelectItems,
  selectedIds,
  recepcionable,
  onOpenPaymentFor,
  updateFechaVencimiento,
  hasCredit,
}: PropsPage) {
  if (!registro) {
    return <p className="text-xs text-muted-foreground p-4">Sin registro.</p>;
  }

  const normalizados = normalizarDetalles(registro.detalles);
  void normalizados;

  const isCompraCompleted = registro.estado === "RECIBIDO";
  const addedToStock = ["RECIBIDO", "RECIBIDO_PARCIAL"].includes(
    registro.estado,
  );

  const partialDisableReason = React.useMemo(() => {
    if (isCompraCompleted) return "La compra ya fue recibida.";
    if (hasCredit) return "La compra ya tiene un crédito ligado.";
    return null;
  }, [isCompraCompleted, hasCredit]);

  const isPartialDisabled = !!partialDisableReason;

  React.useEffect(() => {
    if (isPartialDisabled && isRecibirParcial) setIsRecibirParcial(false);
  }, [isPartialDisabled, isRecibirParcial, setIsRecibirParcial]);

  const confirmDisableReason = React.useMemo(() => {
    if (addedToStock) return "Ya está en stock.";
    if (hasCredit) return "Hay un crédito ligado.";
    if (isRecibirParcial) return "Usa 'Recepcionar parcial'.";
    return null;
  }, [addedToStock, hasCredit, isRecibirParcial]);

  const confirmDisabled = !!confirmDisableReason;

  const estadoConfig =
    ESTADO_CONFIG[registro.estado] ?? ESTADO_CONFIG.ESPERANDO_ENTREGA;
  const EstadoIcon = estadoConfig.icon;

  return (
    <div className="mx-auto  space-y-4 p-1">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.header
        variants={fade}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-2"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold leading-none truncate">
            Compra{" "}
            <span className="text-muted-foreground font-normal">
              #{registro.id}
            </span>
          </h1>
          {registro.sucursal && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {registro.sucursal.nombre}
            </p>
          )}
        </div>

        <Badge
          variant={estadoConfig.variant}
          className="gap-1 text-xs shrink-0"
        >
          <EstadoIcon className="h-3 w-3" aria-hidden />
          {estadoConfig.label}
        </Badge>
      </motion.header>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        role="list"
        aria-label="Resumen de la compra"
      >
        {[
          {
            icon: Calendar,
            label: "Fecha",
            value: formattFechaWithMinutes(registro.fecha),
          },
          {
            icon: DollarSign,
            label: "Total",
            value: formattMonedaGT(registro.total),
          },
          {
            icon: Package,
            label: "Productos",
            value: String(registro.resumen.items),
          },
          {
            icon: Receipt,
            label: "Factura",
            value: registro.conFactura ? "Sí" : "No",
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            role="listitem"
            className="border rounded-md px-3 py-2 flex items-center gap-2"
          >
            <Icon
              className="h-3.5 w-3.5 text-muted-foreground shrink-0"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none">
                {label}
              </p>
              <p className="text-xs font-medium truncate mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Info grid: usuario + proveedor ──────────────────────────────── */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="visible"
        className="grid gap-2 sm:grid-cols-2"
      >
        {/* Usuario */}
        <section
          aria-labelledby="usuario-heading"
          className="border rounded-md px-3 py-2.5 space-y-1.5"
        >
          <h2
            id="usuario-heading"
            className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"
          >
            <User className="h-3 w-3" aria-hidden /> Usuario responsable
          </h2>
          <Separator />
          <div className="space-y-1">
            <InfoRow label="Nombre" value={registro.usuario.nombre} />
            <InfoRow
              label="Correo"
              value={registro.usuario.correo}
              icon={<Mail className="h-3 w-3 text-muted-foreground" />}
            />
          </div>
        </section>

        {/* Proveedor */}
        <section
          aria-labelledby="proveedor-heading"
          className="border rounded-md px-3 py-2.5 space-y-1.5"
        >
          <h2
            id="proveedor-heading"
            className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"
          >
            <Building2 className="h-3 w-3" aria-hidden /> Proveedor
          </h2>
          <Separator />
          <div className="space-y-1">
            <InfoRow
              label="Nombre"
              value={registro.proveedor?.nombre ?? "Sin asignar"}
            />
            <InfoRow
              label="Sucursal"
              value={registro.sucursal?.nombre ?? "N/A"}
            />
          </div>
        </section>
      </motion.div>

      {/* ── Origen: Requisición ─────────────────────────────────────────── */}
      {registro.origen === "REQUISICION" && registro.requisicion && (
        <RequisicionInfo requisicion={registro.requisicion} />
      )}

      {/* ── Origen: Pedido ──────────────────────────────────────────────── */}
      {registro.origen === "PEDIDO" && registro.pedido && (
        <PedidoInfo pedido={registro.pedido} />
      )}

      {/* ── Factura ─────────────────────────────────────────────────────── */}
      {registro.conFactura && registro.factura && (
        <motion.section
          variants={fade}
          initial="hidden"
          animate="visible"
          aria-labelledby="factura-heading"
          className="border rounded-md px-3 py-2.5 space-y-1.5"
        >
          <h2
            id="factura-heading"
            className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"
          >
            <Receipt className="h-3 w-3" aria-hidden /> Factura
          </h2>
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <InfoRow label="Número" value={registro.factura.numero ?? "N/A"} />
            <InfoRow
              label="Fecha"
              value={formattFechaWithMinutes(registro.factura.fecha)}
            />
          </div>
        </motion.section>
      )}

      {/* ── Resumen numérico ─────────────────────────────────────────────── */}
      <motion.section
        variants={fade}
        initial="hidden"
        animate="visible"
        aria-labelledby="resumen-heading"
        className="border rounded-md px-3 py-2.5 space-y-1.5"
      >
        <h2
          id="resumen-heading"
          className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"
        >
          <ShoppingCart className="h-3 w-3" aria-hidden /> Resumen
        </h2>
        <Separator />
        <dl className="grid grid-cols-3 divide-x text-center">
          {[
            { term: "Productos únicos", value: String(registro.resumen.items) },
            {
              term: "Cantidad total",
              value: String(registro.resumen.cantidadTotal),
            },
            {
              term: "Subtotal",
              value: formattMonedaGT(registro.resumen.subtotal),
            },
          ].map(({ term, value }) => (
            <div key={term} className="px-2 py-1">
              <dd className="text-sm font-semibold tabular-nums">{value}</dd>
              <dt className="text-[11px] text-muted-foreground">{term}</dt>
            </div>
          ))}
        </dl>
      </motion.section>

      {/* ── Detalles / productos ─────────────────────────────────────────── */}
      <motion.section
        variants={fade}
        initial="hidden"
        animate="visible"
        aria-labelledby="detalles-heading"
        className="border rounded-md overflow-hidden"
      >
        <div className="px-3 py-2 border-b flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <h2 id="detalles-heading" className="text-xs font-semibold">
            Productos comprados
            <span className="text-muted-foreground font-normal ml-1">
              ({registro.detalles.length})
            </span>
          </h2>
        </div>

        <div
          className="max-h-72 overflow-y-auto divide-y"
          role="list"
          aria-label="Lista de productos"
        >
          {registro.detalles.map((detalle) => (
            <div
              key={detalle.id}
              role="listitem"
              className="px-3 py-2 hover:bg-muted/40 transition-colors"
            >
              {/* producto nombre + código + subtotal */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    #{detalle.producto.id}
                  </span>
                  <span className="text-xs font-medium truncate">
                    {detalle.producto.nombre}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1 py-0 h-4 shrink-0"
                  >
                    {detalle.producto.codigo}
                  </Badge>
                </div>
                <span className="text-xs font-semibold tabular-nums shrink-0">
                  {formattMonedaGT(detalle.subtotal)}
                </span>
              </div>

              {/* métricas */}
              <dl className="grid grid-cols-4 gap-1 text-center">
                {[
                  { term: "Cant.", value: String(detalle.cantidad) },
                  {
                    term: "C. Unit.",
                    value: formattMonedaGT(detalle.costoUnitario),
                  },
                  {
                    term: "P. Actual",
                    value: formattMonedaGT(
                      detalle.producto.precioCostoActual ?? 0,
                    ),
                  },
                  {
                    term: "Subtotal",
                    value: formattMonedaGT(detalle.subtotal),
                  },
                ].map(({ term, value }) => (
                  <div key={term} className="bg-muted/30 rounded px-1 py-0.5">
                    <dd className="text-xs font-medium tabular-nums">
                      {value}
                    </dd>
                    <dt className="text-[10px] text-muted-foreground">
                      {term}
                    </dt>
                  </div>
                ))}
              </dl>

              {detalle.creadoEn && (
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" aria-hidden />
                  {formattFechaWithMinutes(detalle.creadoEn)}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Auditoría ───────────────────────────────────────────────────── */}
      <motion.section
        variants={fade}
        initial="hidden"
        animate="visible"
        aria-labelledby="auditoria-heading"
        className="border rounded-md px-3 py-2.5 space-y-1.5"
      >
        <h2
          id="auditoria-heading"
          className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"
        >
          <Clock className="h-3 w-3" aria-hidden /> Auditoría
        </h2>
        <Separator />
        <div className="grid grid-cols-2 gap-2">
          <InfoRow
            label="Creado"
            value={formattFechaWithMinutes(registro.creadoEn)}
          />
          <InfoRow
            label="Actualizado"
            value={formattFechaWithMinutes(registro.actualizadoEn)}
          />
        </div>
      </motion.section>

      {/* ── Switch recepción parcial ─────────────────────────────────────── */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-2">
          <Switch
            id="recibirParcial"
            disabled={isPartialDisabled}
            checked={isRecibirParcial}
            onCheckedChange={(checked) => {
              setIsRecibirParcial(checked);
              if (checked) reFetchDRP();
            }}
            aria-describedby={
              partialDisableReason ? "parcial-reason" : undefined
            }
          />
          <Label
            htmlFor="recibirParcial"
            className="text-xs cursor-pointer select-none"
          >
            {isPartialDisabled
              ? "Recepción parcial (bloqueado)"
              : "Recibir de forma parcial"}
          </Label>
        </div>
        {partialDisableReason && (
          <p
            id="parcial-reason"
            className="text-[11px] text-muted-foreground pl-8"
          >
            {partialDisableReason}
          </p>
        )}
      </motion.div>

      {/* ── Tabla parcial ────────────────────────────────────────────────── */}
      {isRecibirParcial && (
        <motion.div
          variants={fade}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {isPendingDrp ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <TableRecepcionCompraSelect
              updateCantidadDetalle={updateCantidadDetalle}
              selectedIds={selectedIds}
              selectedItems={selectedItems}
              detalles={recepcionable.detalles}
              upsserSelectItems={upsserSelectItems}
              updateFechaVencimiento={updateFechaVencimiento}
            />
          )}
          <CardSummary selectedItems={selectedItems} />
        </motion.div>
      )}

      {/* ── Acciones ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-center gap-2 pt-1"
      >
        <Button
          size="sm"
          disabled={confirmDisabled}
          onClick={() => onOpenPaymentFor("NORMAL")}
          aria-disabled={confirmDisabled}
          aria-describedby={confirmDisabled ? "confirm-reason" : undefined}
          className="text-xs"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Confirmar recepción
        </Button>

        {isRecibirParcial && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenPaymentFor("PARCIAL")}
            className="text-xs"
          >
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Recepcionar parcial
          </Button>
        )}

        {confirmDisableReason && (
          <p id="confirm-reason" className="text-[11px] text-muted-foreground">
            {confirmDisableReason}
          </p>
        )}
      </motion.div>
    </div>
  );
}

// ─── InfoRow helper ─────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-1 min-w-0">
      <span className="text-[11px] text-muted-foreground shrink-0">
        {label}:
      </span>
      <span className="text-xs font-medium truncate flex items-center gap-1">
        {icon}
        {value}
      </span>
    </div>
  );
}

// ─── RequisicionInfo ────────────────────────────────────────────────────────
function RequisicionInfo({
  requisicion,
}: {
  requisicion: CompraRequisicionUI;
}) {
  return (
    <motion.section
      variants={fade}
      initial="hidden"
      animate="visible"
      aria-labelledby="req-heading"
      className="border rounded-md px-3 py-2.5 space-y-1.5"
    >
      <h2
        id="req-heading"
        className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"
      >
        <ClipboardList className="h-3 w-3" aria-hidden /> Requisición asociada
      </h2>
      <Separator />
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { term: "Folio", value: requisicion.folio },
          { term: "Estado", value: requisicion.estado },
          { term: "Líneas", value: String(requisicion.totalLineas) },
          { term: "Fecha", value: formattFechaWithMinutes(requisicion.fecha) },
        ].map(({ term, value }) => (
          <div key={term}>
            <dt className="text-[10px] text-muted-foreground">{term}</dt>
            <dd className="text-xs font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </motion.section>
  );
}

// ─── PedidoInfo ──────────────────────────────────────────────────────────────
function PedidoInfo({ pedido }: { pedido: CompraPedidoUI }) {
  return (
    <motion.section
      variants={fade}
      initial="hidden"
      animate="visible"
      aria-labelledby="pedido-heading"
      className="border rounded-md px-3 py-2.5 space-y-1.5"
    >
      <h2
        id="pedido-heading"
        className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"
      >
        <FileText className="h-3 w-3" aria-hidden /> Pedido asociado
      </h2>
      <Separator />
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { term: "Folio", value: pedido.folio },
          { term: "Estado", value: pedido.estado },
          { term: "Tipo", value: pedido.tipo },
          { term: "Fecha", value: formattFechaWithMinutes(pedido.fecha) },
        ].map(({ term, value }) => (
          <div key={term}>
            <dt className="text-[10px] text-muted-foreground">{term}</dt>
            <dd className="text-xs font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </motion.section>
  );
}

export default ComprasMain;
