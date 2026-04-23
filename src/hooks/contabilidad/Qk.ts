export const contabilidadQKeys = {
  cuentas: () => ["contabilidad", "cuentas"],
  reglas: () => ["contabilidad", "reglas"],
};
export const asientosQKeys = {
  all: () => ["asientos-contables"],
  list: () => [...asientosQKeys.all(), "list"],
  detail: (id: number) => [...asientosQKeys.all(), id],
};
