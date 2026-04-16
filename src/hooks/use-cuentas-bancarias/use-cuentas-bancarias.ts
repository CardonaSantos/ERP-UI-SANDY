import { erpEndpoints } from "@/API/routes/endpoints";
import { cuentasBancariasQkeys } from "./Qk";
import { erp } from "@/API/erpApi";
import { CuentasBancariasSelect } from "@/Types/CuentasBancarias/CuentasBancariasSelect";

export function useGetCuentasBancarias() {
  return erp.useQueryApi<Array<CuentasBancariasSelect>>(
    cuentasBancariasQkeys.cuentas,
    erpEndpoints.cuentas_bancarias,
    undefined,
    { staleTime: 5 * 60_000, refetchOnWindowFocus: false },
  );
}
