import { PageTransition } from "@/components/Transition/layout-transition";
import { ReusableTabs, TabItem } from "@/utils/components/tabs/reusable-tabs";
import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTabChangeWithUrl } from "@/utils/components/tabs/handleTabChangeWithParamURL";
import { useGetPresupuestos } from "@/hooks/use-costos-presupuestales/use-costos-presupuestales";
import { PresupuestosDashboard } from "./components/presupuestos/presupuestos";
import { useMovimientosPresupuestalesTable } from "@/hooks/use-movimientos-presupuestales/use-movimientos-presupuestales";
import { PaginatedMovimientos } from "@/Types/movimientos-presupuestales-table/interfaces";
import { MovimientosPresupuestalesTable } from "./components/movimientos/movimientos-presupuestales-table";
type PaginationDataSafe = Required<PaginatedMovimientos>; // Remove optional properties

function CostoPresupuestalMainPage() {
  // 1. Llamamos a las queries (React Query se encarga de la caché)
  // Usamos el rename y valor por defecto para evitar el error de 'map'
  const { data: presupuestos = [], isLoading: isLoadingPresupuestos } =
    useGetPresupuestos();

  const [query, setQuery] = useState<any>();
  console.log(setQuery);

  const { data: dataFetched, isLoading: loadingMovimientos } =
    useMovimientosPresupuestalesTable(query);

  const getPaginationData = (
    data: PaginatedMovimientos | undefined,
  ): PaginationDataSafe => ({
    data: data?.data ?? [],
    page: data?.page ?? 0,
    pageSize: data?.pageSize ?? 10,
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
  });

  const safeData = getPaginationData(dataFetched);

  const [searchParams, setSearchParams] = useSearchParams();
  // Cambiamos el default a 'dashboard' o 'presupuestos' porque es lo que más verá el usuario
  const defaultTab = (searchParams.get("tab") as string) || "presupuestos";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const handleChangeTabs = useTabChangeWithUrl({
    activeTab,
    setActiveTab,
    searchParams,
    setSearchParams,
  });

  const tabs: Array<TabItem> = [
    {
      label: "Gestión de Presupuestos",
      value: "presupuestos",
      icon: <LayoutDashboard size={18} />,
      content: (
        <PresupuestosDashboard
          data={presupuestos}
          isLoading={isLoadingPresupuestos}
        />
      ),
    },

    {
      label: "Movimientos Financieros",
      value: "movimientos-financieros",
      icon: <LayoutDashboard size={18} />,
      content: (
        <MovimientosPresupuestalesTable
          data={safeData.data}
          isLoading={loadingMovimientos}
        />
      ),
    },
  ];

  return (
    <PageTransition titleHeader="Control Presupuestal" fallbackBackTo="/">
      <ReusableTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleTabChange={handleChangeTabs}
        tabs={tabs}
      />
    </PageTransition>
  );
}

export default CostoPresupuestalMainPage;
