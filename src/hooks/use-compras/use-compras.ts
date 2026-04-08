// === QUERIES ================================================================

import {
  keepPreviousData,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { comprasQkeys } from "./Qk";
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import {
  CompraRegistroUI,
  PaginatedComprasResponse,
} from "@/Types/compras/interfaces";
import { GetRegistrosComprasQuery } from "@/Pages/Compras/API/interfaceQuery";

export function useGetCompras(
  query: GetRegistrosComprasQuery,
  // options?: Partial<UseQueryOptions<PaginatedComprasResponse>>,
) {
  return erp.useQueryApi<PaginatedComprasResponse>(
    comprasQkeys.list(query),
    erpEndpoints.compras.get_compras,
    { params: query },
    undefined,
  );
}

export function useGetCompraDetails(
  id: number,
  // options?: Partial<UseQueryOptions<CompraRegistroUI>>,
) {
  return erp.useQueryApi<CompraRegistroUI>(
    comprasQkeys.detail(id),
    erpEndpoints.compras.get_compra_details(id),
    undefined,
    undefined,
  );
}

// === MUTATIONS ==============================================================

export function useRecepcionarCompraTotal(compraId: number) {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, any>(
    "post",
    erpEndpoints.compras.recepcionar(compraId),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: comprasQkeys.lists(),
          refetchType: "all",
        });

        queryClient.invalidateQueries({
          queryKey: comprasQkeys.detail(compraId),
        });
      },
    },
  );
}

export function useRecepcionarCompraParcial(compraId: number) {
  const queryClient = useQueryClient();

  return erp.useMutationApi<void, any>(
    "post",
    erpEndpoints.compras.recepcionar_parcial,
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: comprasQkeys.detail(compraId),
        });
        queryClient.invalidateQueries({
          queryKey: comprasQkeys.recepcionable(compraId),
        });

        // Aplícalo también aquí
        queryClient.invalidateQueries({
          queryKey: comprasQkeys.lists(),
          refetchType: "all",
        });
      },
    },
  );
}
