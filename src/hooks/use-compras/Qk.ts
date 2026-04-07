import { GetRegistrosComprasQuery } from "@/Pages/Compras/API/interfaceQuery";

export const comprasQkeys = {
  all_clean: ["compras"] as const,

  all: (query: GetRegistrosComprasQuery) => ["compras", query] as const,
  specific: (id: number) => ["compras", id] as const,

  details: (id: number) => ["compra", id] as const,
  recepcionable: (id: number) => ["compra-recepcionable", id] as const,
};
