"use client";

import { useGetPresupuestoDetalle } from "@/hooks/use-costos-presupuestales/use-costos-presupuestales";
import { useParams, useNavigate } from "react-router-dom";
import { PresupuestoDetalle } from "./presupuesto-details";

/**
 * Route: /presupuestos/:id
 *
 * Reads `id` from React Router params, calls useGetPresupuestoDetalle(id),
 * and renders the detail view.
 *
 * In a real app, replace the import of `useGetPresupuestoDetalle` with:
 *   import { useGetPresupuestoDetalle } from "@/hooks/costos-presupuestales";
 * which calls:
 *   erp.useQueryApi<PresupuestoDetalleView>(
 *     CostosPresupuestalesQkeys.presupuesto(id),
 *     erpEndpoints.costos_presupuestales.byId(id),
 *   )
 */
export function PresupuestoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const numericId = Number(id);

  const { data, isLoading, isError } = useGetPresupuestoDetalle(numericId);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <p className="text-sm font-medium">
          No se pudo cargar el presupuesto #{numericId}.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-xs underline underline-offset-4 hover:text-slate-950"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <p className="text-sm font-medium">
          Presupuesto #{numericId} no encontrado.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-xs underline underline-offset-4 hover:text-slate-950"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <PresupuestoDetalle
      data={data!}
      isLoading={isLoading}
      onBack={() => navigate(-1)}
    />
  );
}
