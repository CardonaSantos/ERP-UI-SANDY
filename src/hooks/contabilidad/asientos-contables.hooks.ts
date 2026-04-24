import { erp } from "@/API/erpApi";
import { asientosQKeys } from "./Qk";
import { erpEndpoints } from "@/API/routes/endpoints";
import {
  AsientoContable,
  AsientoContablePaginatedResponse,
  CreateAsientoContableDto,
} from "@/Types/contabilidad/asientos-contables/asiento-contables";
import { useInvalidateHandler } from "@/utils/query";
import {
  EstadoAsientoContable,
  OrigenAsientoContable,
} from "@/Types/contabilidad/types-enums";

interface GetAsientosParams {
  page?: number;
  pageSize?: number;
  estado?: EstadoAsientoContable | "";
  origen?: OrigenAsientoContable | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useGetAsientosContables(params: GetAsientosParams = {}) {
  const {
    page = 1,
    pageSize = 10,
    estado = "",
    origen = "",
    sortBy = "fecha",
    sortOrder = "desc",
  } = params;

  const queryKey = asientosQKeys.list({
    page,
    pageSize,
    estado: estado || undefined,
    origen: origen || undefined,
    sortBy,
    sortOrder,
  });

  const searchParams = new URLSearchParams();
  searchParams.append("page", page.toString());
  searchParams.append("pageSize", pageSize.toString());
  if (estado) searchParams.append("estado", estado);
  if (origen) searchParams.append("origen", origen);
  searchParams.append("sortBy", sortBy);
  searchParams.append("sortOrder", sortOrder);

  return erp.useQueryApi<AsientoContablePaginatedResponse>(
    queryKey,
    `${erpEndpoints.contabilidad.asientos.get_all}?${searchParams.toString()}`,
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
