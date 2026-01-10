import dayjs from "dayjs";
import { FormCreditoState } from "./credito-venta.interfaces";
import { generarCuotas } from "./generarCuotas";

export function buildCuotas(prev: FormCreditoState) {
  const enganche =
    prev.planCuotaModo === "PRIMERA_MAYOR"
      ? Number(prev.cuotaInicialPropuesta || 0)
      : 0;

  return generarCuotas({
    totalProductos: Number(prev.totalPropuesto || 0),
    enganche,
    cuotasTotales: Number(prev.cuotasTotalesPropuestas || 1),
    plan: prev.planCuotaModo,
    fechaPrimeraCuota: prev.fechaPrimeraCuota || dayjs().format("YYYY-MM-DD"),
    diasEntrePagos: Number(prev.diasEntrePagos || 30),
    interesTipo: prev.interesTipo,
    interesPorcentaje: Number(prev.interesPorcentaje || 0),
    interesSobreVenta: Number(prev.interesSobreVenta || 0),
  });
}
