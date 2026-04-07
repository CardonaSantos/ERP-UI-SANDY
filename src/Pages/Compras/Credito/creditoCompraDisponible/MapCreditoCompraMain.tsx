// MapCreditoCompraMain.tsx
"use client";

import { UICreditoCompra } from "./interfaces/interfaces";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import MapCuotasCreditoCompra from "./mapCuotas";
import { CajaConSaldo } from "@/utils/components/SelectMethodPayment/PurchasePaymentFormDialog";
import { DesvanecerHaciaArriba } from "@/Pages/movimientos-cajas/utils/animations";
import { DetalleNormalizado } from "../../table-select-recepcion/detalleNormalizado";

dayjs.locale("es");

interface CreditoAvaliableProps {
  creditoFromCompra: UICreditoCompra | undefined;
  handleRefresAll: () => void;
  userId: number;
  documentoId: number;
  sucursalId: number;
  cajasDisponibles: CajaConSaldo[];
  cuentasBancarias: Array<{ id: number; nombre: string }>;
  proveedores: Array<{ id: number; nombre: string }>;
  normalizados: DetalleNormalizado[];
  compraId: number;
}

const fmt = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
      }).format(n)
    : "—";

const estadoMap: Record<string, { label: string; className: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  PARCIAL: {
    label: "Parcial",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PAGADO: {
    label: "Pagado",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  ANULADO: {
    label: "Anulado",
    className: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

const EstadoBadge = ({ estado }: { estado: string }) => {
  const v = estadoMap[estado] ?? {
    label: estado,
    className: "bg-muted text-foreground/80 border-border",
  };
  return (
    <Badge
      className={`rounded-full px-2 py-0.5 text-[10px] border ${v.className}`}
    >
      {v.label}
    </Badge>
  );
};

/** Pair label / value compacto */
const InfoPair = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="space-y-0.5">
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className="text-xs font-medium">{value}</p>
    {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
  </div>
);

function MapCreditoCompraMain({
  creditoFromCompra,
  userId,
  handleRefresAll,
  documentoId,
  sucursalId,
  cajasDisponibles,
  cuentasBancarias,
  proveedores,
  normalizados,
  compraId,
}: CreditoAvaliableProps) {
  if (!creditoFromCompra) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No hay registro de crédito válido</AlertDescription>
      </Alert>
    );
  }

  const {
    folioProveedor,
    estado,
    fechaEmisionISO,
    fechaVencimientoISO,
    condicionPago,
    totalCuotas,
    cuotasPagadas,
    cuotasPendientes,
    totalPagado,
    saldoPendiente,
    montoOriginal,
    interesTotal,
  } = creditoFromCompra;

  const porcentajePagado =
    montoOriginal > 0
      ? Math.round(((totalPagado ?? 0) / montoOriginal) * 100)
      : 0;

  return (
    <motion.div {...DesvanecerHaciaArriba} className="space-y-3">
      {/* Header */}
      <section
        aria-labelledby="credito-title"
        className="rounded-md border p-3 space-y-2"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span id="credito-title" className="text-sm font-medium">
                Crédito por compra
              </span>
              <EstadoBadge estado={estado} />
              {condicionPago?.nombre && (
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] px-2 py-0.5"
                >
                  {condicionPago.nombre}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Emisión: {dayjs(fechaEmisionISO).format("DD MMM YYYY")}
              </span>
              {fechaVencimientoISO && (
                <span className="inline-flex items-center gap-1">
                  Vence: {dayjs(fechaVencimientoISO).format("DD MMM YYYY")}
                </span>
              )}
              {folioProveedor && (
                <span className="inline-flex items-center gap-1">
                  Folio: {folioProveedor}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={handleRefresAll}
          >
            <RefreshCw className="h-3 w-3" />
            Actualizar
          </Button>
        </div>

        {/* Stats compactas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t">
          <InfoPair
            label="Monto original"
            value={fmt(montoOriginal)}
            hint={`Interés: ${fmt(interesTotal)}`}
          />
          <InfoPair
            label="Total pagado"
            value={fmt(totalPagado)}
            hint={`${porcentajePagado}% pagado`}
          />
          <InfoPair label="Saldo pendiente" value={fmt(saldoPendiente)} />
          <InfoPair
            label="Cuotas"
            value={`${cuotasPagadas}/${totalCuotas} pagadas`}
            hint={`${cuotasPendientes} pendientes`}
          />
        </div>

        {/* Condición de pago chips */}
        {condicionPago && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {[
                ["Modo", condicionPago.modoGeneracion ?? "—"],
                ["Interés", condicionPago.tipoInteres ?? "—"],
                ["%", String(condicionPago.interes ?? 0)],
                ["Días crédito", String(condicionPago.diasCredito ?? 0)],
                ["Cada", `${condicionPago.diasEntreCuotas ?? 0} días`],
                [
                  "# Cuotas",
                  String(condicionPago.cantidadCuotas ?? totalCuotas),
                ],
              ].map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5"
                >
                  <span className="text-muted-foreground">{k}:</span>
                  <span className="font-medium text-foreground">{v}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Detalle de cuotas */}
      <MapCuotasCreditoCompra
        normalizados={normalizados}
        cuentasBancarias={cuentasBancarias}
        proveedores={proveedores}
        cajasDisponibles={cajasDisponibles}
        sucursalId={sucursalId}
        documentoId={documentoId}
        userId={userId}
        handleRefresAll={handleRefresAll}
        cuotas={creditoFromCompra.cuotas}
        compraId={compraId}
      />
    </motion.div>
  );
}

export default MapCreditoCompraMain;
