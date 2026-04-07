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

const getApiErrorMessageAxios = (err: unknown): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ??
  (err as { message?: string })?.message ??
  "Error desconocido";

export function RequisicionesPage() {
  const { data: partidas_presupuestos } = useGetPresupuestosPartidas();
  const partidas = partidas_presupuestos ? partidas_presupuestos : [];

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

  const mutationSendToCompras = useGenerarCompra();
  const mutationDeleteRequisicion = useDeleteRequisicion();

  const handleSendToCompras = async (dto: SendToComprasDTO) => {
    if (
      !dto.requisicionID ||
      !dto.userID ||
      !dto.proveedorId ||
      !dto.presupuestoId
    ) {
      toast.warning("Faltan datos para el envío");
      return;
    }

    await toast.promise(mutationSendToCompras.mutateAsync(dto), {
      loading: "Enviando a módulo de compras...",
      success: "Requisición enviada y saldo comprometido correctamente",
      error: (err) => getApiErrorMessageAxios(err),
    });
  };

  const handleDeleteRequisicion = async (id: number) => {
    if (!id) {
      toast.warning("ID de requisición inválido");
      return;
    }

    await toast.promise(mutationDeleteRequisicion.mutateAsync(id), {
      loading: "Eliminando requisición...",
      success: "Requisición eliminada correctamente",
      error: (err) => getApiErrorMessageAxios(err),
    });
  };

  return (
    <div className="">
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
