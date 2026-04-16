export const cajasQkeys = {
  // Base para todas las queries de cajas
  all: ["cajas"] as const,

  // Lista de cajas por sucursal
  cajas: (sucursalId: number) =>
    [...cajasQkeys.all, "disponibles", sucursalId] as const,

  // Detalle de una caja previa específica
  caja_previa_data: (sucursalId: number, registroCajaId: number) =>
    [...cajasQkeys.cajas(sucursalId), "previa-data", registroCajaId] as const,

  ultima_caja_abierta: () =>
    [...cajasQkeys.all, "ultima-caja-abierta"] as const,

  ultimo_saldo_sucursal: () =>
    [...cajasQkeys.all, "ultimo-saldo-sucursal"] as const,
};
