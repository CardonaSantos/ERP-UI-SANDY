import { ProductosResponse } from "@/Pages/POS/interfaces/newProductsPOSResponse";
import { useApiQuery } from "../genericoCall/genericoCallHook";
import { useVentasQkeys } from "./Qk";

export interface NewQueryDTO {
  nombreItem: string;
  tipoEmpaque: number[];
  codigoItem: string;
  codigoProveedor: string;
  cats: number[];
  priceRange: string;
  sucursalId: number;
  limit: number;
  page: number;
}
export type NewQueryPOS = NewQueryDTO & { q?: string };

export function useFetchVentas(query: NewQueryPOS) {
  return useApiQuery<ProductosResponse>(
    useVentasQkeys.query(query),
    "products/get-products-presentations-for-pos",
    { params: query },
    {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: "always",
      refetchOnReconnect: true,
      retry: 1,
    },
  );
}

//   const {
//     data: productsResponse = {
//       data: [],
//       meta: {
//         limit: 10,
//         page: 1,
//         totalCount: 0,
//         totalPages: 1,
//         totals: { presentaciones: 0, productos: 0 },
//       },
//     },
//     refetch: refetchProducts,
//     isFetching: isLoadingProducts,
//     isError: isErrorProducts,
//     error: errorProducts,
//   } = useApiQuery<ProductosResponse>(
//     ["products-pos-response", apiParams],
//     "products/get-products-presentations-for-pos",
//     { params: apiParams },
//     {
//       staleTime: 1000 * 60 * 5,
//       refetchOnWindowFocus: false,
//       refetchOnMount: "always",
//       refetchOnReconnect: true,
//       retry: 1,
//     },
//   );
