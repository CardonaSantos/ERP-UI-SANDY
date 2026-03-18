import { useQueryClient } from "@tanstack/react-query";
import { CostosPresupuestalesQkeys } from "./Qk";
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import {
  CreatePartidaDto,
  CreatePeriodoDto,
  CreatePresupuestoDto,
} from "./mutations";

// --- CREACIÓN DE PARTIDA ---
export function usePostPartida() {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, CreatePartidaDto>(
    "post",
    erpEndpoints.costos_presupuestales.partidas,
    {},
    {
      onSuccess: () => {
        // Al crear una partida, invalidamos la lista de partidas
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.partidas,
        });
      },
    },
  );
}

// --- CREACIÓN DE PERIODO ---
export function usePostPeriodo() {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, CreatePeriodoDto>(
    "post",
    erpEndpoints.costos_presupuestales.periodos,
    {},
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.periodos,
        });
      },
    },
  );
}

// --- CREACIÓN DE PRESUPUESTO (ASIGNACIÓN) ---
export function usePostPresupuesto() {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, CreatePresupuestoDto>(
    "post",
    erpEndpoints.costos_presupuestales.presupuestos,
    {},
    {
      onSuccess: () => {
        // Al asignar un nuevo presupuesto, invalidamos la lista general
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuestos,
        });
      },
    },
  );
}
