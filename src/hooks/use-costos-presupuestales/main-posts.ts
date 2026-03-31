import { useQueryClient } from "@tanstack/react-query";
import { CostosPresupuestalesQkeys } from "./Qk";
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import {
  CreateCentroCostoDto,
  CreatePartidaDto,
  CreatePeriodoDto,
  CreatePresupuestoDto,
  PresupuestoAjusteDto,
} from "./mutations";
import { toast } from "sonner";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";

// --- CREACIÓN DE PARTIDA ---
export function usePostPartida() {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, CreatePartidaDto>(
    "post",
    erpEndpoints.costos_presupuestales.partidas,
    {},
    {
      onSuccess: () => {
        toast.info("Ejecutando"); // ← aquí sí tiene sentido
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

// --- AJUSTE DE MONTO ---

export function usePresupuestoAjuste(id: number) {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, PresupuestoAjusteDto>(
    "patch",
    erpEndpoints.costos_presupuestales.ajustar(id),
    {},
    {
      onSuccess: () => {
        toast.info(`Ejecutando a presupuesto: ${id}`);
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuesto(id),
        });
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuestos,
        });
      },
      onError: (error) => {
        toast.error(getApiErrorMessageAxios(error));
      },
    },
  );
}

export function useGetCentrosCosto() {
  return erp.useQueryApi<Array<any>>(
    CostosPresupuestalesQkeys.centros_costos,
    "/centros-costo",
  );
}

export function usePostCentroCosto() {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, CreateCentroCostoDto>(
    "post",
    "/centros-costo",
    {},
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.centros_costos,
        });
      },
    },
  );
}
