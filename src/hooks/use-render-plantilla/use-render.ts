import { useApiQuery } from "../genericoCall/genericoCallHook";
import { contratoRenderQkeys } from "./Qk";

export interface ContratoRenderResponse {
  ventaCuotaId: number;
  plantillaId: number;
  html: string;
}

export function useContratoRender(ventaCuotaId: number, plantillaId: number) {
  return useApiQuery<ContratoRenderResponse>(
    contratoRenderQkeys.byIds(ventaCuotaId, plantillaId),
    `plantilla-legal-credito/render/${ventaCuotaId}/${plantillaId}`,
    undefined,
    {
      enabled: !!ventaCuotaId && !!plantillaId,
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
}
