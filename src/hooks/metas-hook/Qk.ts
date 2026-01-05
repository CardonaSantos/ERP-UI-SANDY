export const metasQKeys = {
  all: ["metas"] as const,
  summary: ["metas", "summary"] as const,
  tienda: (sucursalId: number | string | undefined) =>
    sucursalId
      ? (["metas", "tienda", sucursalId] as const)
      : (["metas", "tienda"] as const),
  cobros: (sucursalId: number | string | undefined) =>
    sucursalId
      ? (["metas", "cobros", sucursalId] as const)
      : (["metas", "cobros"] as const),
  users: ["metas", "users"] as const,
};
