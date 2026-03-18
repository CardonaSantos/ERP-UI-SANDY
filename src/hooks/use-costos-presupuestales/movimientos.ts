import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import { CostosPresupuestalesQkeys } from "./Qk";

// 1. Comprometer Saldo
export function useComprometerPresupuesto(id: number) {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, any>(
    "post",
    erpEndpoints.costos_presupuestales.comprometer(id),
    {},
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuestos,
        });
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuesto(id),
        });
      },
    },
  );
}

// 2. Ejercer Saldo (Compra)
export function useEjercerPresupuesto(id: number) {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, any>(
    "post",
    erpEndpoints.costos_presupuestales.ejercer(id),
    {},
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuestos,
        });
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuesto(id),
        });
      },
    },
  );
}

// 3. Liberar Saldo (Cancelación)
export function useLiberarPresupuesto(id: number) {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, any>(
    "post",
    erpEndpoints.costos_presupuestales.liberar(id),
    {},
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuestos,
        });
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuesto(id),
        });
      },
    },
  );
}

// 4. Ajustar Presupuesto (Ampliar/Reducir)
export function useActualizarPresupuesto(id: number) {
  const queryClient = useQueryClient();
  return erp.useMutationApi<void, { montoAsignado: number }>(
    "patch",
    erpEndpoints.costos_presupuestales.ajustar(id),
    {},
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuestos,
        });
        queryClient.invalidateQueries({
          queryKey: CostosPresupuestalesQkeys.presupuesto(id),
        });
      },
    },
  );
}
