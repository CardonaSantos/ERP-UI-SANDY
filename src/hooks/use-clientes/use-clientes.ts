import { ClientSelect } from "@/Types/clients/cliente-select";
import { useApiQuery } from "../genericoCall/genericoCallHook";
import { clientesQkeys } from "./Qk";

export function useClientes() {
  return useApiQuery<ClientSelect[]>(
    clientesQkeys.all,
    "client/get-all-customers",
    undefined,
    {
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
      refetchInterval: 10_000,
    },
  );
}
