import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

export function createApiHooks(client: AxiosInstance) {
  function normalize(endpoint: string) {
    return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  }

  return {
    useQueryApi<TData, TError = Error>(
      key: QueryKey,
      endpoint: string,
      config?: AxiosRequestConfig,
      options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">,
    ) {
      return useQuery<TData, TError>({
        queryKey: key,
        queryFn: async () => {
          const { data } = await client.get<TData>(normalize(endpoint), config);
          return data;
        },
        ...options,
      });
    },

    useMutationApi<TData, TVariables = unknown, TError = unknown>(
      method: "post" | "put" | "patch" | "delete",
      endpoint: string,
      config?: AxiosRequestConfig,
      options?: UseMutationOptions<TData, TError, TVariables>,
    ) {
      return useMutation<TData, TError, TVariables>({
        mutationFn: async (variables) => {
          const { data } = await client.request<TData>({
            url: normalize(endpoint),
            method,
            data: variables,
            ...config,
          });

          return data;
        },
        ...options,
      });
    },
  };
}
