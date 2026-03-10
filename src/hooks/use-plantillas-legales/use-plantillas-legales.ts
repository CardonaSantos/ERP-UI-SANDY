// hooks/usePlantillaLegal.ts
import {
  CreatePlantillaLegalDto,
  PlantillaLegalCredito,
  UpdatePlantillaLegalDto,
} from "@/features/plantillas-legales";
import { useApiQuery, useApiMutation } from "../genericoCall/genericoCallHook";
import { plantillaLegalQkeys } from "./Qk";

// ─── GET ALL ───────────────────────────────────────────────────────────────
export function usePlantillasLegales() {
  return useApiQuery<PlantillaLegalCredito[]>(
    plantillaLegalQkeys.all,
    "plantilla-legal-credito",
    undefined,
    {
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  );
}

// ─── GET BY ID ─────────────────────────────────────────────────────────────
export function usePlantillaLegalById(id: number) {
  return useApiQuery<PlantillaLegalCredito>(
    plantillaLegalQkeys.byId(id),
    `plantilla-legal-credito/${id}`,
    undefined,
    {
      enabled: !!id,
      staleTime: 0,
      retry: 1,
    },
  );
}

// ─── CREATE ────────────────────────────────────────────────────────────────
export function useCreatePlantillaLegal() {
  return useApiMutation<PlantillaLegalCredito, CreatePlantillaLegalDto>(
    "post",
    "plantilla-legal-credito",
  );
}

// ─── UPDATE ────────────────────────────────────────────────────────────────
export function useUpdatePlantillaLegal(id: number) {
  return useApiMutation<PlantillaLegalCredito, UpdatePlantillaLegalDto>(
    "patch",
    `plantilla-legal-credito/${id}`,
  );
}

// ─── DELETE ────────────────────────────────────────────────────────────────
export function useDeletePlantillaLegal() {
  return useApiMutation<void, { id: number }>(
    "post",
    `plantilla-legal-credito/delete`,
  );
}
