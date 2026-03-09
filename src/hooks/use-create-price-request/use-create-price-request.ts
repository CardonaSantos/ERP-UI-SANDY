import { useApiMutation } from "../genericoCall/genericoCallHook";

export function useCreatePriceRequest() {
  return useApiMutation<any, any>("post", "price-request");
}
