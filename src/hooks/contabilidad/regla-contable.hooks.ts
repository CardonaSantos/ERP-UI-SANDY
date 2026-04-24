import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { useInvalidateHandler } from "@/utils/query";
import { contabilidadQKeys } from "./Qk";
import { ReglaContable } from "@/Types/contabilidad/regla-contable/regla-contable";
import {
  CreateReglaContableDto,
  UpdateReglaContableDto,
} from "@/Types/contabilidad/mutations-types/mutations-types";

export function useGetReglasContables() {
  return erp.useQueryApi<ReglaContable[]>(
    contabilidadQKeys.reglas(),
    erpEndpoints.contabilidad.reglas.get_all,
  );
}

export function useCreateReglaContable() {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<CreateReglaContableDto>(
    "post",
    erpEndpoints.contabilidad.reglas.create,
    undefined,
    {
      onSuccess: () => {
        invalidate(contabilidadQKeys.reglas());
      },
    },
  );
}

export function useUpdateReglaContable(id: number) {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<UpdateReglaContableDto>(
    "patch",
    erpEndpoints.contabilidad.reglas.update(id),
    undefined,
    {
      onSuccess: () => {
        invalidate(contabilidadQKeys.reglas());
      },
    },
  );
}

export function useDeleteReglaContable(id: number) {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<void>(
    "delete",
    erpEndpoints.contabilidad.reglas.delete(id),
    undefined,
    {
      onSuccess: () => {
        invalidate(contabilidadQKeys.reglas());
      },
    },
  );
}
