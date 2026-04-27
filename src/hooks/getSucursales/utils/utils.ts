import { Sucursal } from "@/Pages/ResumenesDelDia/types";
import { SucursalResponseSelect } from "../Interfaces/interfaces";

// /sucursales/utils/parseSucursal.ts
export function parseSucursal(api: SucursalResponseSelect): Sucursal {
  return {
    id: api.id,
    nombre: api.nombre.trim(),
  };
}
