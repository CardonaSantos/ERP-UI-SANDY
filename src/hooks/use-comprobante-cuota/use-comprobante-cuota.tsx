import { CuotaComprobante } from "@/features/comprobante-cuota/comprobante-cuota";
import { useApiQuery } from "../genericoCall/genericoCallHook";

export const cuotaComprobanteQkeys = {
  byId: (id: number) => ["cuota-comprobante", id] as const,
};

export function useCuotaComprobante(cuotaId: number) {
  return useApiQuery<CuotaComprobante>(
    cuotaComprobanteQkeys.byId(cuotaId),
    `credito-cuota/${cuotaId}`,
    undefined,
    {
      enabled: !!cuotaId && cuotaId > 0,
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
}
