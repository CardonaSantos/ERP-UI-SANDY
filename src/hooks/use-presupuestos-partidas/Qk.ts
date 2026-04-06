export const presupuesto_partidasQkeys = {
  all: ["presupuestos-partidas"] as const,
  specific: (id: number) => ["presupuestos-partidas", id] as const,
};
