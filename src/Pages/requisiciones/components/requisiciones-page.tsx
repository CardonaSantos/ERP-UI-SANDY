"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useProveedoresSelect } from "@/hooks/getProveedoresSelect/proveedores";
import { SendToComprasDTO } from "@/Types/requisiciones/requisiciones-tables";
import { ProveedorOption } from "./send-to-purchase";
import { RequisitionsTable } from "./requisiciones-table";
import { useGetPresupuestosPartidas } from "@/hooks/use-presupuestos-partidas/use-presupuestos-partidas";
import {
  useDeleteRequisicion,
  useGenerarCompra,
  useGetRequisiciones,
} from "@/hooks/use-requisiciones/use-requisiciones";

// Importamos los nuevos hooks de dominio

const getApiErrorMessageAxios = (err: unknown): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ??
  (err as { message?: string })?.message ??
  "Error desconocido";

type SendToComprasExtDTO = SendToComprasDTO & {
  partidaPresupuestalId: string;
};

export function RequisicionesPage() {
  const { data: partidas_presupuestos } = useGetPresupuestosPartidas();
  const partidas = partidas_presupuestos ? partidas_presupuestos : [];

  // 1. Usamos el hook de dominio (¡Mira qué limpio!)
  const {
    data: requisiciones = [],
    isFetching: isLoadingRequisiciones,
    isError: isErrorRequisiciones,
    error: errorRequisiciones,
    refetch: refetchRequisiciones,
  } = useGetRequisiciones();

  const { data: proveedoresRaw = [] } = useProveedoresSelect();

  const proveedores: ProveedorOption[] = useMemo(
    () =>
      (proveedoresRaw ?? []).map((p) => ({
        id: p.id,
        nombre: p.nombre,
        telefonoContacto: p.telefonoContacto,
      })),
    [proveedoresRaw],
  );

  // 2. Instanciamos las mutaciones
  const mutationSendToCompras = useGenerarCompra();
  const mutationDeleteRequisicion = useDeleteRequisicion(); // Ya no necesita el ID inicial

  // 3. Handlers simplificados
  const handleSendToCompras = async (dto: SendToComprasExtDTO) => {
    if (
      !dto.requisicionID ||
      !dto.userID ||
      !dto.proveedorId ||
      !dto.partidaPresupuestalId
    ) {
      toast.warning("Faltan datos para el envío");
      return;
    }

    await toast.promise(mutationSendToCompras.mutateAsync(dto), {
      loading: "Enviando a módulo de compras...",
      success: "Requisición enviada y saldo comprometido correctamente",
      error: (err) => getApiErrorMessageAxios(err),
    });
    // ¡Ya no necesitas refetch() manual aquí! El hook invalida la caché.
  };

  const handleDeleteRequisicion = async (id: number) => {
    if (!id) {
      toast.warning("ID de requisición inválido");
      return;
    }

    await toast.promise(
      // Pasamos el ID directamente al mutateAsync
      mutationDeleteRequisicion.mutateAsync(id),
      {
        loading: "Eliminando requisición...",
        success: "Requisición eliminada correctamente",
        error: (err) => getApiErrorMessageAxios(err),
      },
    );
    // ¡Ya no necesitas refetch() manual aquí tampoco!
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-base font-semibold">Requisiciones</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gestión y seguimiento de requisiciones de compra
        </p>
      </div>

      <RequisitionsTable
        data={requisiciones}
        isLoading={isLoadingRequisiciones}
        isError={isErrorRequisiciones}
        error={errorRequisiciones}
        onRefetch={refetchRequisiciones}
        proveedores={proveedores}
        partidas={partidas}
        isSendingToCompras={mutationSendToCompras.isPending}
        isDeletingRequisicion={mutationDeleteRequisicion.isPending}
        onSendToCompras={handleSendToCompras}
        onDeleteRequisicion={handleDeleteRequisicion}
      />
    </div>
  );
}

export default RequisicionesPage;
