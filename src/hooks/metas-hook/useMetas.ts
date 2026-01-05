import { MetaCobros, MetaTienda, UsuarioSucursal } from "@/Pages/Metas/types";
import { useApiMutation, useApiQuery } from "../genericoCall/genericoCallHook";
import { metasQKeys } from "./Qk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../getClientsSelect/Queries/axiosClient";

/**
 * Summary (combina metasTienda y metasCobros)
 */
export function useMetasSummary() {
  return useApiQuery<{ metasTienda: MetaTienda[]; metasCobros: MetaCobros[] }>( // respuesta esperada
    metasQKeys.summary,
    `/metas/get-all-metas-to-summary`,
    undefined,
    {
      select: (data) => ({
        metasTienda: data?.metasTienda ?? [],
        metasCobros: data?.metasCobros ?? [],
      }),
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
      retry: 1,
    }
  );
}

/**
 * Metas de tienda por sucursal
 */
export function useMetasTienda(sucursalId?: number) {
  return useApiQuery<MetaTienda[]>(
    metasQKeys.tienda(sucursalId),
    `/metas/get-all-seller-goals/${sucursalId ?? ""}`,
    undefined,
    {
      enabled: Number.isFinite(Number(sucursalId)) && (sucursalId ?? 0) > 0,
      select: (data) => data ?? [],
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
      retry: 1,
    }
  );
}

/**
 * Metas de cobros por sucursal
 */
export function useMetasCobros(sucursalId?: number) {
  return useApiQuery<MetaCobros[]>(
    metasQKeys.cobros(sucursalId),
    `/metas/get-all-cobros-metas/${sucursalId ?? ""}`,
    undefined,
    {
      enabled: Number.isFinite(Number(sucursalId)) && (sucursalId ?? 0) > 0,
      select: (data) => data ?? [],
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
      retry: 1,
    }
  );
}

/**
 * Usuarios (para asignar metas)
 */
export function useMetasUsers() {
  return useApiQuery<UsuarioSucursal[]>(
    metasQKeys.users,
    `/metas/get-all-metas-users`,
    undefined,
    {
      select: (data) => data ?? [],
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
      retry: 1,
    }
  );
}

// MUTACIONES
// Hook para crear meta (Tienda)
export function useCreateMetaTienda() {
  const qc = useQueryClient();

  return useApiMutation("post", `/metas`, undefined, {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: metasQKeys.summary });
      qc.invalidateQueries({ queryKey: metasQKeys.tienda(undefined) });
    },
  });
}

// Hook para crear meta de cobros
export function useCreateMetaCobro() {
  const qc = useQueryClient();

  return useApiMutation("post", `/metas/regist-new-meta-cobros`, undefined, {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: metasQKeys.summary });
      qc.invalidateQueries({ queryKey: metasQKeys.cobros(undefined) });
    },
  });
}

/**
 * Delete meta tienda (DELETE con path params dinámicos).
 * Variables: { goalId: number, userId: number, passwordAdmin: string }
 */
export function useDeleteMetaTienda() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    unknown,
    { goalId: number; userId: number; passwordAdmin: string }
  >({
    mutationFn: async ({ goalId, userId, passwordAdmin }) => {
      const url = `/metas/delete-one-goal/${goalId}/${userId}`;
      const res = await axiosClient.delete(url, { data: { passwordAdmin } });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: metasQKeys.tienda(undefined) });
      qc.invalidateQueries({ queryKey: metasQKeys.summary });
    },
  });
}

/**
 * Delete meta cobro
 * Variables: { cobroId: number; userId: number; passwordAdmin: string }
 */
export function useDeleteMetaCobro() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    unknown,
    { cobroId: number; userId: number; passwordAdmin: string }
  >({
    mutationFn: async ({ cobroId, userId, passwordAdmin }) => {
      const url = `/metas/delete-one-cobro-goal/${cobroId}/${userId}`;
      const res = await axiosClient.delete(url, { data: { passwordAdmin } });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: metasQKeys.cobros(undefined) });
      qc.invalidateQueries({ queryKey: metasQKeys.summary });
    },
  });
}

/**
 * Delete deposito (depósito de cobro)
 * Variables: { metaId: number, depositoId: number }
 */
export function useDeleteDepositoCobro() {
  const qc = useQueryClient();

  return useMutation<unknown, unknown, { metaId: number; depositoId: number }>({
    mutationFn: async ({ metaId, depositoId }) => {
      const url = `/metas/delete-one-payment/${metaId}/${depositoId}`;
      const res = await axiosClient.delete(url);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: metasQKeys.cobros(undefined) });
      qc.invalidateQueries({ queryKey: metasQKeys.summary });
      qc.invalidateQueries({ queryKey: ["metas", "cobro", variables.metaId] });
    },
  });
}

// ACTUALIZACIONES
/**
 * Update meta tienda
 * Variables: { id: number; payload: Partial<MetaTienda> }
 */
export function useUpdateMetaTienda() {
  const qc = useQueryClient();

  return useApiMutation<unknown, { id: number; payload: Partial<MetaTienda> }>(
    "patch",
    `/metas/update-one-meta`,
    undefined,
    {
      mutationFn: async ({ id, payload }) => {
        const res = await axiosClient.patch(
          `/metas/update-one-meta/${id}`,
          payload
        );
        return res.data;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: metasQKeys.tienda(undefined) });
        qc.invalidateQueries({ queryKey: metasQKeys.summary });
      },
    }
  );
}

/**
 * Update meta cobro
 * Variables: { id: number; payload: Partial<MetaCobros> }
 */
export function useUpdateMetaCobro() {
  const qc = useQueryClient();

  return useApiMutation<unknown, { id: number; payload: Partial<MetaCobros> }>(
    "patch",
    `/metas/update-one-meta-cobro`,
    undefined,
    {
      mutationFn: async ({ id, payload }) => {
        const res = await axiosClient.patch(
          `/metas/update-one-meta-cobro/${id}`,
          payload
        );
        return res.data;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: metasQKeys.cobros(undefined) });
        qc.invalidateQueries({ queryKey: metasQKeys.summary });
      },
    }
  );
}
