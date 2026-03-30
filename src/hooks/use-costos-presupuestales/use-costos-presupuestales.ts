import { erp } from "@/API/erpApi";
import { PresupuestoDetalleView } from "@/Types/costos presupuestales/costos_presupuestales";
import { CostosPresupuestalesQkeys } from "./Qk";
import { erpEndpoints } from "@/API/routes/endpoints";
import { PresupuestoListItem } from "@/Types/costos presupuestales/presupuestos_all";
import {
  CentroCosto,
  Partida,
  Periodo,
} from "@/Types/costos presupuestales/partida-periodo-costo";

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

// Catálogos Tipados
export function useGetPartidas() {
  return erp.useQueryApi<Partida[]>(
    CostosPresupuestalesQkeys.partidas,
    erpEndpoints.costos_presupuestales.partidas,
  );
}

export function useGetPeriodos() {
  return erp.useQueryApi<Periodo[]>(
    CostosPresupuestalesQkeys.periodos,
    erpEndpoints.costos_presupuestales.periodos,
  );
}

export function useGetCentrosCosto() {
  return erp.useQueryApi<CentroCosto[]>(
    CostosPresupuestalesQkeys.centros_costos,
    erpEndpoints.costos_presupuestales.centros_costos,
  );
}
