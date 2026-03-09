import { useApiMutation } from "../genericoCall/genericoCallHook";

export function useCreateVenta() {
  return useApiMutation<any, any>("post", "venta");
}
