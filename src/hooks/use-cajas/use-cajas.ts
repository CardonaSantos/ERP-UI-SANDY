import { erpEndpoints } from "@/API/routes/endpoints";
import { cajasQkeys } from "./Qk";
import { erp } from "@/API/erpApi";
import { CajaConSaldo } from "@/utils/components/SelectMethodPayment/PurchasePaymentFormDialog";

import { CajaAbierta, IniciarCaja } from "@/Pages/Caja/types/interfaces";
import { useInvalidateHandler } from "@/utils/query";
import {
  CerrarCajaV2Dto,
  PreviaCierreResponse,
} from "@/Pages/Caja/types/cierres.types";
import { CrearMovimientoFinancieroDto } from "@/Pages/Caja/Movimientos/movimientos-financieros";

/**
 * GETTER DE SELECT PARA CAJAS DISPONIBLES
 * @param sucursalId
 * @returns
 */
export function useGetCajasDisponibles(sucursalId: number) {
  return erp.useQueryApi<CajaConSaldo[]>(
    cajasQkeys.cajas(sucursalId),
    erpEndpoints.cajas.disponibles(sucursalId),
    undefined,
    { enabled: !!sucursalId, staleTime: 30_000, refetchOnWindowFocus: false },
  );
}

/**
 * CERRAR EL TURNO
 * @returns
 */
export function useCloseCaja() {
  const query = useInvalidateHandler();

  return erp.useMutationApi<CerrarCajaV2Dto>(
    "post",
    erpEndpoints.cajas.cerrar_caja,
    undefined,
    {
      onSuccess: () => {
        query(cajasQkeys.all);
      },
    },
  );
}

/**
 * INICAR TURNO EN CAJA
 * @returns
 */
export function useIniciarCaja() {
  const query = useInvalidateHandler();
  return erp.useMutationApi<IniciarCaja>(
    "post",
    erpEndpoints.cajas.iniciar_caja,
    undefined,
    {
      onSuccess: () => {
        query(cajasQkeys.all);
      },
    },
  );
}

/**
 * PREVIA A CIERRE - DATOS REALES
 * @param sucursalId
 * @param registroCajaId
 * @param usuarioId
 * @returns
 */
export function useGetPreviaCaja(
  sucursalId: number,
  registroCajaId: number,
  usuarioId: number,
) {
  return erp.useQueryApi<PreviaCierreResponse>(
    cajasQkeys.caja_previa_data(sucursalId, registroCajaId),
    erpEndpoints.cajas.caja_previa_data,
    {
      params: {
        sucursalId: sucursalId,
        registroCajaId: registroCajaId,
        usuarioId: usuarioId,
      },
    },
    {
      enabled: !!registroCajaId,
    },
  );
}

/**
 * GET ULTIMA CAJA ABIERTA EN TURNO
 * @param sucursalId
 * @param userId
 * @returns
 */
export function useGetUltimaCajaAbierta(sucursalId: number, userId: number) {
  return erp.useQueryApi<CajaAbierta>(
    cajasQkeys.ultima_caja_abierta(),
    erpEndpoints.cajas.ultima_caja_abierta(sucursalId, userId),
    undefined,
    undefined,
  );
}

/**
 * GETTER ULTIMO SALDO DE LA SUCURSAL - INICAR TURNO
 * @param sucursalId
 * @param userId
 * @returns
 */
export function useGetUltimoSaldoSucursal(sucursalId: number, userId: number) {
  return erp.useQueryApi<number>(
    cajasQkeys.ultimo_saldo_sucursal(),
    erpEndpoints.cajas.ultimo_saldo_sucursal(sucursalId, userId),
    undefined,
    undefined,
  );
}

export function useDeleteMovimiento(movimientoId: number) {
  return erp.useMutationApi<void, void>(
    "delete",
    erpEndpoints.movimiento.delete_movimiento(movimientoId),
    undefined,
    undefined,
  );
}

export function useCreateMovimientoFinanciero() {
  return erp.useMutationApi<CrearMovimientoFinancieroDto>(
    "post",
    erpEndpoints.movimiento.create_movimiento,
    undefined,
    undefined,
  );
}

// const res = await axios.post(`${API_URL}/movimiento-financiero`, data);
