import { erp } from "@/API/erpApi";
import { PresupuestoDetalleView } from "@/Types/costos presupuestales/costos_presupuestales";
import { CostosPresupuestalesQkeys } from "./Qk";
import { erpEndpoints } from "@/API/routes/endpoints";
import { PresupuestoListItem } from "@/Types/costos presupuestales/presupuestos_all";

// Obtener lista de presupuestos
export function useGetPresupuestos() {
  return erp.useQueryApi<Array<PresupuestoListItem>>(
    CostosPresupuestalesQkeys.presupuestos,
    erpEndpoints.costos_presupuestales.presupuestos,
  );
}

// Obtener detalle de un presupuesto (Historial completo)
export function useGetPresupuestoDetalle(id: number) {
  return erp.useQueryApi<PresupuestoDetalleView>(
    CostosPresupuestalesQkeys.presupuesto(id),
    erpEndpoints.costos_presupuestales.byId(id),
  );
}

// Catálogos
export function useGetPartidas() {
  return erp.useQueryApi<Array<any>>(
    CostosPresupuestalesQkeys.partidas,
    erpEndpoints.costos_presupuestales.partidas,
  );
}

export function useGetPeriodos() {
  return erp.useQueryApi<Array<any>>(
    CostosPresupuestalesQkeys.periodos,
    erpEndpoints.costos_presupuestales.periodos,
  );
}
