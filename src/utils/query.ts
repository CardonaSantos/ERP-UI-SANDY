import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateHandler() {
  const queryClient = useQueryClient();

  return (queryKey: readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  };
}
