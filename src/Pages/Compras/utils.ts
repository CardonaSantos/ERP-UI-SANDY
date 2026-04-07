import { CajaConSaldo } from "@/utils/components/SelectMethodPayment/PurchasePaymentFormDialog";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { PayloadRecepcionParcial } from "./table-select-recepcion/selectedItems";
import { CompraRegistroUI } from "@/Types/compras/interfaces";
import dayjs from "dayjs";
import { TZGT } from "../Utils/Utils";

export interface Option {
  label: string;
  value: string;
}

export type CajaDisponibleLike = {
  id: number | string;
  saldoInicial: number | string;
  disponibleEnCaja: number | string;
};

export const isBankMethod = (method?: string | null) =>
  method === "TRANSFERENCIA" || method === "TARJETA" || method === "CHEQUE";

export const isCashMethod = (method?: string | null) =>
  method === "EFECTIVO" || method === "CONTADO";

export const createCajaOptions = (
  cajasDisponibles: CajaDisponibleLike[],
  formattMonedaGT: (value: number | string) => string,
) =>
  cajasDisponibles.map((caja) => ({
    label: `Caja #${caja.id} · Inicial ${formattMonedaGT(
      caja.saldoInicial,
    )} · Disponible ${formattMonedaGT(caja.disponibleEnCaja)}`,
    value: String(caja.id),
  }));

export const buildInitialSelectedItems = (
  compraId: number,
  userId: number,
  sucursalId: number,
): PayloadRecepcionParcial => ({
  compraId,
  fecha: dayjs().tz(TZGT).startOf("day").toISOString(),
  observaciones: "",
  usuarioId: userId,
  sucursalId,
  lineas: [],
});

export type RecepcionFlow = "NORMAL" | "PARCIAL";

export const calculateMontoRecepcion = (
  flow: RecepcionFlow,
  registro: CompraRegistroUI | null,
  selectedItems: PayloadRecepcionParcial,
) => {
  if (flow === "PARCIAL") {
    return selectedItems.lineas.reduce(
      (acc, item) => acc + item.cantidadRecibida * item.precioCosto,
      0,
    );
  }
  return Number(registro?.resumen?.subtotal ?? registro?.total ?? 0);
};

export const buildCajaOptions = (cajas: CajaConSaldo[]): Option[] =>
  cajas.map((c) => ({
    label: `Caja #${c.id} · Inicial ${formattMonedaGT(
      c.saldoInicial,
    )} · Disponible ${formattMonedaGT(c.disponibleEnCaja)}`,
    value: c.id.toString(),
  }));

export const validateParcial = (data: PayloadRecepcionParcial) =>
  !!(data.compraId && data.sucursalId && data.usuarioId && data.lineas?.length);
