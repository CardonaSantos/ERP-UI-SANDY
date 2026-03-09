import { NewQueryPOS } from "./use-ventas";

export const useVentasQkeys = {
  all: ["products-pos-response"] as const,
  query: (query: NewQueryPOS) => ["products-pos-response", query] as const,
};
