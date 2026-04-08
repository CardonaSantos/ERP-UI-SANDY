import { GetRegistrosComprasQuery } from "@/Pages/Compras/API/interfaceQuery";

// Qk.ts - CAMBIO RADICAL

export const comprasQkeys = {
  all: ["compras"] as const,
  lists: () => [...comprasQkeys.all, "list"] as const,

  list: (query: GetRegistrosComprasQuery) =>
    [...comprasQkeys.lists(), query] as const,

  details_all: () => ["compra-detalle"] as const,
  detail: (id: number) => ["compra-detalle", id] as const,

  recepcionables: () => ["compra-recepcionable"] as const,
  recepcionable: (id: number) => ["compra-recepcionable", id] as const,
};

// export const comprasQkeys = {
//   all: ["compras"] as const,
//   lists: () => [...comprasQkeys.all, "list"] as const,
//   list: (query: GetRegistrosComprasQuery) =>
//     [...comprasQkeys.lists(), query] as const,

//   // list: (params: GetRegistrosComprasQuery) => {
//   //   const { page = 1, limit = 10, withDetalles = true } = params;
//   //   return [...comprasQkeys.lists(), { page, limit, withDetalles }] as const;
//   // },

//   details_all: () => ["compra-detalle"] as const,
//   detail: (id: number) => ["compra-detalle", id] as const,

//   recepcionables: () => ["compra-recepcionable"] as const,
//   recepcionable: (id: number) => ["compra-recepcionable", id] as const,
// };
