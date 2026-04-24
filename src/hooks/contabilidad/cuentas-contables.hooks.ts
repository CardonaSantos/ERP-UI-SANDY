import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { contabilidadQKeys } from "./Qk";
import { useInvalidateHandler } from "@/utils/query";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import {
  CreateCuentaContableDto,
  UpdateCuentaContableDto,
} from "@/Types/contabilidad/mutations-types/mutations-types";

export function useGetCuentasContables() {
  return erp.useQueryApi<CuentaContable[]>(
    contabilidadQKeys.cuentas(),
    erpEndpoints.contabilidad.cuentas.get_all,
  );
}

export function useCreateCuentaContable() {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<CreateCuentaContableDto>(
    "post",
    erpEndpoints.contabilidad.cuentas.create,
    undefined,
    {
      onSuccess: () => {
        invalidate(contabilidadQKeys.cuentas());
      },
    },
  );
}

export function useUpdateCuentaContable(id: number) {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<UpdateCuentaContableDto>(
    "put",
    erpEndpoints.contabilidad.cuentas.update(id),
    undefined,
    {
      onSuccess: () => {
        invalidate(contabilidadQKeys.cuentas());
      },
    },
  );
}

export function useDeleteCuentaContable(id: number) {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<void>(
    "delete",
    erpEndpoints.contabilidad.cuentas.delete(id),
    undefined,
    {
      onSuccess: () => {
        invalidate(contabilidadQKeys.cuentas());
      },
    },
  );
}
