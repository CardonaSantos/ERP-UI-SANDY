export const contabilidadQKeys = {
  cuentas: () => ["contabilidad", "cuentas"],
  reglas: () => ["contabilidad", "reglas"],
};
export const asientosQKeys = {
  all: () => ["asientos-contables"],
  // list: () => [...asientosQKeys.all(), "list"],
  list: (params?: Record<string, any>) => [
    ...asientosQKeys.all(),
    "list",
    params,
  ],

  detail: (id: number) => [...asientosQKeys.all(), id],
};
