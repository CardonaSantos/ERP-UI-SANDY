import { GetCajasQuery, GetMovimientosQuery } from "./use-cajas";

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

  registros: (params: GetCajasQuery = {}) =>
    [
      ...cajasQkeys.all,
      "registros",
      {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        sucursalId: params.sucursalId ?? null,
        estado: params.estado ?? null,
        depositado:
          typeof params.depositado === "boolean" ? params.depositado : null,
        fechaAperturaInicio: params.fechaAperturaInicio ?? null,
        fechaAperturaFin: params.fechaAperturaFin ?? null,
        fechaCierreInicio: params.fechaCierreInicio ?? null,
        fechaCierreFin: params.fechaCierreFin ?? null,
        tipo: params.tipo ?? null,
        categoria: params.categoria ?? null,
        fechaMovInicio: params.fechaMovInicio ?? null,
        fechaMovFin: params.fechaMovFin ?? null,
        search: params.search ?? null,
        groupBySucursal:
          typeof params.groupBySucursal === "boolean"
            ? params.groupBySucursal
            : null,
      },
    ] as const,

  registros_movimientos: (params: GetMovimientosQuery = {}) =>
    [
      ...cajasQkeys.all,
      "movimientos",
      {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        sucursalId: params.sucursalId ?? null,
        search: params.search ?? null,
        usadoParaCierre:
          typeof params.usadoParaCierre === "boolean"
            ? params.usadoParaCierre
            : null,
        groupBySucursal:
          typeof params.groupBySucursal === "boolean"
            ? params.groupBySucursal
            : null,
        tipo: params.tipo ?? null,
        categoria: params.categoria ?? null,
        fechaInicio: params.fechaInicio ?? null,
        fechaFin: params.fechaFin ?? null,
      },
    ] as const,
};
