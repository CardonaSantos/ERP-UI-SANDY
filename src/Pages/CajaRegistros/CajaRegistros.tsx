"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Clipboard, ReceiptText } from "lucide-react";
import Table from "./Table/Table";
import MovimientosTable from "../movimientos-cajas/TableMovimientosCaja";

import { RegistroCajaResponse } from "./interfaces/registroscajas.interfaces";
import { MovimientoCajaItem } from "../movimientos-cajas/Interfaces/registroCajas";

import { useStore } from "@/components/Context/ContextSucursal";
import { PageTransition } from "@/components/Transition/layout-transition";
import { useSearchParams } from "react-router-dom";

import { ReusableTabs, TabItem } from "@/utils/components/tabs/reusable-tabs";
import { useTabChangeWithUrl } from "@/utils/components/tabs/handleTabChangeWithParamURL";

import {
  useGetRegistrosCajas,
  useGetRegistrosMovimientos,
} from "@/hooks/use-cajas/use-cajas";

function CajaRegistros() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get("tab") as string) || "cajas";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const sucursalId = useStore((state) => state.sucursalId) ?? 0;

  const { data: cajasData, isLoading: loadingCajas } = useGetRegistrosCajas({
    page,
    limit,
    sucursalId,
  });

  const cajas: RegistroCajaResponse[] = cajasData?.items ?? [];
  const totalCajas = cajasData?.total ?? 0;
  const pagesCajas = cajasData?.pages ?? 0;

  const { data: movData, isLoading: loadingMovimientos } =
    useGetRegistrosMovimientos({
      page,
      limit,
    });

  const movimientos: MovimientoCajaItem[] = movData?.items ?? [];
  const totalMov = movData?.total ?? 0;
  const pagesMov = movData?.pages ?? 0;

  // Tabs handler
  const handleChangeTabs = useTabChangeWithUrl({
    activeTab,
    setActiveTab,
    searchParams,
    setSearchParams,
  });

  const Loader = (
    <Card>
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Cargando registros...
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const dataTabs: Array<TabItem> = [
    {
      label: "Turnos en Caja",
      value: "cajas",
      icon: <Clipboard size={15} />,
      content: loadingCajas ? (
        Loader
      ) : (
        <Table
          data={cajas}
          page={page}
          limit={limit}
          pages={pagesCajas}
          total={totalCajas}
          loading={loadingCajas}
          onChangePage={setPage}
          onChangeLimit={setLimit}
        />
      ),
    },
    {
      label: "Movimientos Financieros",
      value: "movimientos-financieros",
      icon: <ReceiptText size={15} />,
      content: loadingMovimientos ? (
        Loader
      ) : (
        <MovimientosTable
          data={movimientos}
          page={page}
          limit={limit}
          pages={pagesMov}
          total={totalMov}
          loading={loadingMovimientos}
          onChangePage={setPage}
          onChangeLimit={setLimit}
        />
      ),
    },
  ];

  return (
    <PageTransition
      fallbackBackTo="/"
      titleHeader="Cajas y Movimientos Financieros"
    >
      <ReusableTabs
        tabs={dataTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        defaultValue={defaultTab}
        handleTabChange={handleChangeTabs}
        variant="compact"
      />
    </PageTransition>
  );
}

export default CajaRegistros;
