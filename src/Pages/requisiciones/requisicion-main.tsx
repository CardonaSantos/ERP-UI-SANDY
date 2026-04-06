"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { BookText, Grid2x2Plus } from "lucide-react";

import { useStore } from "@/components/Context/ContextSucursal";

import { AdvancedDialog } from "@/utils/components/AdvancedDialog";

import RequisitionCandidatesTable from "./requisicion-table-pick";
import {
  useRequisitionCandidatesQuery,
  useCreateRequisitionMutation,
  CreateRequisitionDto,
  CreateRequisitionLine,
} from "./requisicion.queries";

import { PageTransition } from "@/components/Transition/layout-transition";

import RequisicionesPage from "./components/requisiciones-page";
import { ReusableTabs, TabItem } from "@/utils/components/tabs/reusable-tabs";
import { useTabChangeWithUrl } from "@/utils/components/tabs/handleTabChangeWithParamURL";
import { useSearchParams } from "react-router-dom";
import {
  PagedResponse,
  RequisitionProductCandidate,
  SelectedKey,
  SelectedLine,
} from "@/Types/requisiciones/requisiciones-tables";
dayjs.extend(utc);
dayjs.extend(timezone);

const PAGE_SIZE = 10;

export default function RequisitionBuilder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get("tab") as string) || "registros";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const sucursalId = useStore((s) => s.sucursalId) ?? 0;
  const usuarioId = useStore((s) => s.userId) ?? 0;
  const [openGenerateReq, setOpenGenerateReq] = React.useState(false);
  const [selected, setSelected] = React.useState<
    Record<SelectedKey, SelectedLine>
  >({});
  const [q, setQ] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const sortBy = sorting[0]?.id ?? "priority";
  const sortDir = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, refetch, isRefetching } =
    useRequisitionCandidatesQuery(
      sucursalId,
      {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        q,
        sortBy,
        sortDir,
      },
      { enabled: !!sucursalId },
    );

  const selectedCount = Object.keys(selected).length;

  const createMutation = useCreateRequisitionMutation();

  const handleCreate = async () => {
    if (!usuarioId || !sucursalId) {
      toast.error("Faltan datos de usuario/sucursal");
      return;
    }
    if (selectedCount === 0) return;

    const lineas: CreateRequisitionLine[] = Object.values(selected).map((s) => {
      const base = {
        cantidadSugerida: s.cantidad,
        fechaExpiracion: s.fechaExpiracion,
        precioCostoUnitario: s.precioCostoUnitario,
        actualizarCosto: s.actualizarCosto || false,
      };
      return s.scope === "PRODUCTO"
        ? { ...base, productoId: s.productoId! }
        : { ...base, presentacionId: s.presentacionId! };
    });

    const dto: CreateRequisitionDto = { sucursalId, usuarioId, lineas };

    try {
      await createMutation.mutateAsync(dto);
      toast.success("Requisición creada");
      setSelected({});
      setOpenGenerateReq(false);
      refetch();
    } catch {
      toast.error("Error al crear la requisición");
    }
  };

  const dataTabs: Array<TabItem> = [
    {
      content: <RequisicionesPage />,
      label: "Registros",
      value: "registros",
      icon: <BookText size={15} />,
    },

    {
      content: (
        <RequisitionCandidatesTable
          data={data as PagedResponse<RequisitionProductCandidate> | undefined}
          isLoading={isLoading || isRefetching}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          q={q}
          onSearchChange={(val) => {
            setPagination((p) => ({ ...p, pageIndex: 0 }));
            setQ(val);
          }}
          refetch={refetch}
          selected={selected}
          setSelected={setSelected}
        />
      ),
      label: "Generar Requisición",
      value: "generar-requisicion",
      icon: <Grid2x2Plus size={15} />,
    },
  ];

  const handleChangeTabs = useTabChangeWithUrl({
    activeTab,
    setActiveTab,
    searchParams,
    setSearchParams,
  });

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Requisiciones">
      <ReusableTabs
        handleTabChange={handleChangeTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        defaultValue="registros"
        tabs={dataTabs}
      />

      {/* Confirmación generar requisición */}
      <AdvancedDialog
        title="¿Generar requisición?"
        description="Se creará la requisición con las líneas seleccionadas (producto o presentación)."
        onOpenChange={setOpenGenerateReq}
        open={openGenerateReq}
        icon="alert"
        type="info"
        confirmButton={{
          label: "Sí, generar",
          disabled: createMutation.isPending,
          loading: createMutation.isPending,
          loadingText: "Generando...",
          onClick: handleCreate,
        }}
        cancelButton={{
          label: "Cancelar",
          onClick: () => setOpenGenerateReq(false),
          disabled: createMutation.isPending,
        }}
      />
    </PageTransition>
  );
}
