// PaginatedMovimientos
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { movimientosPresupuestalesQk } from "./Qk";
import { PaginatedMovimientos } from "@/Types/movimientos-presupuestales-table/interfaces";

export function useMovimientosPresupuestalesTable(query: any) {
  return erp.useQueryApi<PaginatedMovimientos>(
    movimientosPresupuestalesQk.query(query),
    erpEndpoints.costos_presupuestales.movimientos_presupuestales,
  );
}
