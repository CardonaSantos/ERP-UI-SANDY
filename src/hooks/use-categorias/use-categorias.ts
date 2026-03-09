import {
  CategoriaWithCount,
  CATS_LIST_QK,
} from "@/Pages/Categorias/CategoriasMainPage";
import { useApiQuery } from "../genericoCall/genericoCallHook";

export function useGetCategorias() {
  return useApiQuery<CategoriaWithCount[]>(
    CATS_LIST_QK,
    "/categoria/all-cats-with-counts",

    undefined,
    {
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  );
}
