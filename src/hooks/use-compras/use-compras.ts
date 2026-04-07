import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { GetRegistrosComprasQuery } from "@/Pages/Compras/API/interfaceQuery";
import { comprasQkeys } from "./Qk";
import {
  PaginatedComprasResponse,
  CompraRegistroUI,
} from "@/Types/compras/interfaces";
import {
  UseQueryOptions,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";

export function useGetCompras(
  query: GetRegistrosComprasQuery,
  options?: Partial<UseQueryOptions<PaginatedComprasResponse>>,
) {
  return erp.useQueryApi<PaginatedComprasResponse>(
    comprasQkeys.all(query),
    erpEndpoints.compras.get_compras,
    { params: query },
    {
      placeholderData: keepPreviousData,
      staleTime: 0,
      refetchOnWindowFocus: "always",
      ...options,
    },
  );
}

export function useGetCompraDetails(
  id: number,
  options?: Partial<UseQueryOptions<CompraRegistroUI>>,
) {
  return erp.useQueryApi<CompraRegistroUI>(
    comprasQkeys.specific(id),
    erpEndpoints.compras.get_compra_details(id),
    undefined,
    {
      enabled: Number.isFinite(id) && id > 0,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      ...options,
    },
  );
}

export function useGetCompraRegistro(compraId: number) {
  return erp.useQueryApi<CompraRegistroUI>(
    comprasQkeys.details(compraId),
    erpEndpoints.compras.detalles(compraId),
    undefined,
    {
      enabled: Number.isFinite(compraId) && compraId > 0,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useRecepcionarCompraTotal(compraId: number) {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, any>(
    "post",
    erpEndpoints.compras.recepcionar(compraId),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: comprasQkeys.details(compraId),
        });
        queryClient.invalidateQueries({ queryKey: comprasQkeys.all_clean });
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
          queryKey: comprasQkeys.details(compraId),
        });
        queryClient.invalidateQueries({
          queryKey: comprasQkeys.recepcionable(compraId),
        });
      },
    },
  );
}
