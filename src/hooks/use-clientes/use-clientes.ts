import { useApiQuery } from "../genericoCall/genericoCallHook";
import { clientesQkeys } from "./Qk";

type Client = {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  dpi: string;
  nit: string;
  iPInternet: string;
  direccion: string;
  actualizadoEn: Date;
};

export function useClientes() {
  return useApiQuery<Client[]>(
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
