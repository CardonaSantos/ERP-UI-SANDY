// /queries/sucursales.ts
import { queryOptions } from "@tanstack/react-query";
import { Sucursal, SucursalResponseSelect } from "../Interfaces/interfaces";
import { axiosClient } from "@/hooks/getClientsSelect/Queries/axiosClient";
import { parseSucursal } from "../utils/utils";

export const sucursalesKey = {
  all: ["sucursales"] as const,
  list: () => ["sucursales", "list"] as const,
};

export const sucursalesQueryOptions = () =>
  queryOptions({
    queryKey: sucursalesKey.list(),
    queryFn: async ({ signal }): Promise<Sucursal[]> => {
      console.info("🔎 useSucursales → fetching...");
      const { data } = await axiosClient.get<SucursalResponseSelect[]>(
        "/sucursales",
        {
          signal,
        },
      );
      return data.map(parseSucursal);
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
