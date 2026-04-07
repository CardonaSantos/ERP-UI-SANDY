"use client";

import CardCompraMain from "./CardCompraMain";
import LineasRecepciones from "./LineasRecepciones";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CompraRecepcionesParcialesUI,
  CompraResumenUI,
  UsuarioMinUI,
} from "./interfaces/recepcionesInterfaces";
import { useApiQuery } from "@/hooks/genericoCall/genericoCallHook";

/* ---- defaults ---- */
const EMPTY_USER: UsuarioMinUI = { id: 0, nombre: "", correo: "" };
const EMPTY_COMPRA: CompraResumenUI = {
  id: 0,
  fecha: "",
  estado: "",
  origen: "",
  conFactura: false,
  total: 0,
  usuario: EMPTY_USER,
  totales: {
    lineasOrdenadas: 0,
    unidadesOrdenadas: 0,
    unidadesRecibidas: 0,
    unidadesPendientes: 0,
    recepcionesCount: 0,
  },
  detalles: [],
};
export const DEFAULT_RECEPCIONES_DATA: CompraRecepcionesParcialesUI = {
  compra: EMPTY_COMPRA,
  recepciones: [],
  lineasFlat: [],
};

export default function RecepcionesMain({
  compraId = 1042,
}: {
  compraId?: number;
}) {
  const isPending = false;
  const { data: dataRecepciones = DEFAULT_RECEPCIONES_DATA } =
    useApiQuery<CompraRecepcionesParcialesUI>(
      ["compra-recepciones", compraId],
      `/recepciones/get-recepciones-parciales`,
      {
        params: {
          compraId: compraId,
        },
      },
      {
        placeholderData: DEFAULT_RECEPCIONES_DATA,
        retry: true,
      },
    );

  if (isPending) {
    return (
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <CardCompraMain compra={dataRecepciones.compra} />
      <LineasRecepciones lineas={dataRecepciones.recepciones} />
    </div>
  );
}
