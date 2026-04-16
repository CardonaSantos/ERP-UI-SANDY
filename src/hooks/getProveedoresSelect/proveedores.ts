import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosClient } from "../getClientsSelect/Queries/axiosClient";
import { ProveedoresResponse } from "./interfaces/proveedores.interfaces";
import { parseProveedores } from "./utils/parseProveedores";
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { Proveedor } from "@/Pages/Caja/Movimientos/types";

export type ProveedoresParams = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export const proveedoresKey = {
  all: ["proveedores"] as const,
  select: (params: ProveedoresParams = {}) =>
    ["proveedores", "select", params] as const,
};

export function useProveedoresSelect(params: ProveedoresParams = {}) {
  return useQuery({
    queryKey: proveedoresKey.select(params),
    queryFn: async ({ signal }) => {
      console.info("🔎 useProveedoresSelect → params:", params);
      const { data } = await axiosClient.get<ProveedoresResponse[]>(
        "/proveedor/get-proveedores-hook",
        {
          signal,
          params: {
            q: params.search,
            page: params.page,
            pageSize: params.pageSize,
          },
        },
      );
      return data.map(parseProveedores);
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false, // 🔕 desactiva retries mientras depuras
  });
}

export function useGetProveedores() {
  return erp.useQueryApi<Array<Proveedor>>(
    proveedoresKey.all,
    erpEndpoints.proveedores,
    undefined,
    undefined,
  );
}
