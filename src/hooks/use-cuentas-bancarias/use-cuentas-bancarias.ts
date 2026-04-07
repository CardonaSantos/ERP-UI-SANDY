import { erpEndpoints } from "@/API/routes/endpoints";
import { cuentasBancariasQkeys } from "./Qk";
import { erp } from "@/API/erpApi";

export function useGetCuentasBancarias() {
  return erp.useQueryApi<Array<{ id: number; nombre: string }>>(
    cuentasBancariasQkeys.cuentas,
    erpEndpoints.cuentas_bancarias,
    undefined,
    { staleTime: 5 * 60_000, refetchOnWindowFocus: false },
  );
}
