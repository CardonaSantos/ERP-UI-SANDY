import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { PresupuestoPartidaSelect } from "@/Types/costos presupuestales/selects";
import { presupuesto_partidasQkeys } from "./Qk";

export function useGetPresupuestosPartidas() {
  return erp.useQueryApi<Array<PresupuestoPartidaSelect>>(
    presupuesto_partidasQkeys.all,
    erpEndpoints.costos_presupuestales.presupuestos_select,
  );
}
