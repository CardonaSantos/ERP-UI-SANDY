import { erp } from "@/API/erpApi";
import { asientosQKeys } from "./Qk";
import { erpEndpoints } from "@/API/routes/endpoints";
import {
  AsientoContable,
  CreateAsientoContableDto,
} from "@/Types/contabilidad/asientos-contables/asiento-contables";
import { useInvalidateHandler } from "@/utils/query";

export function useGetAsientosContables() {
  return erp.useQueryApi<AsientoContable[]>(
    asientosQKeys.list(),
    erpEndpoints.contabilidad.asientos.get_all,
  );
}
export function useGetAsientoContable(id: number) {
  return erp.useQueryApi<AsientoContable>(
    asientosQKeys.detail(id),
    erpEndpoints.contabilidad.asientos.get_one(id),
    undefined,
    { enabled: !!id },
  );
}
export function useCreateAsientoContable() {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<AsientoContable, CreateAsientoContableDto>(
    "post",
    erpEndpoints.contabilidad.asientos.create,
    undefined,
    {
      onSuccess: () => {
        invalidate(asientosQKeys.all());
      },
    },
  );
}

export function useAnularAsientoContable(id: number) {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<AsientoContable, void>(
    "post",
    erpEndpoints.contabilidad.asientos.anular(id),
    undefined,
    {
      onSuccess: () => {
        invalidate(asientosQKeys.all());
      },
    },
  );
}
