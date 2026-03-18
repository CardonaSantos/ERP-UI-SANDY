export const CostosPresupuestalesQkeys = {
  all: ["costos-presupuestales"] as const,
  presupuestos: ["costos-presupuestales", "presupuestos"] as const,
  presupuesto: (id: number) =>
    ["costos-presupuestales", "presupuesto", id] as const,
  partidas: ["costos-presupuestales", "partidas"] as const,
  periodos: ["costos-presupuestales", "periodos"] as const,
};
