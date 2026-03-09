import { useApiMutation } from "../genericoCall/genericoCallHook";

export function useCreateCreditoRequest() {
  return useApiMutation<any, any>(
    "post",
    "credito-authorization/create-authorization",
  );
}
