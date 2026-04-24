import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { ResolverReglaContableDto } from "@/Types/contabilidad/mutations-types/mutations-types";
import { ResolverReglaContableResponse } from "@/Types/contabilidad/resolverResponse";

export function useResolverReglaContable() {
  return erp.useMutationApi<
    ResolverReglaContableResponse,
    ResolverReglaContableDto
  >("post", erpEndpoints.contabilidad.reglas.resolver);
}
