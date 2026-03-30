import { PageTransition } from "@/components/Transition/layout-transition";
import { ReusableTabs, TabItem } from "@/utils/components/tabs/reusable-tabs";
import { useState } from "react";
import {
  LayoutDashboard, // Para la vista principal
  ListChecks, // Para las partidas
  CalendarDays, // Para los periodos
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTabChangeWithUrl } from "@/utils/components/tabs/handleTabChangeWithParamURL";

// Componentes
import PartidasCatalogo from "./components/partidas/partidas_presupuestales";
import PeriodosCalendario from "./components/periodos/periodos_presupuestales";
import {
  useGetPartidas,
  useGetPeriodos,
  useGetPresupuestos,
} from "@/hooks/use-costos-presupuestales/use-costos-presupuestales";
import { PresupuestosDashboard } from "./components/presupuestos/presupuestos";

function CostoPresupuestalMainPage() {
  // 1. Llamamos a las queries (React Query se encarga de la caché)
  // Usamos el rename y valor por defecto para evitar el error de 'map'
  const { data: presupuestos = [], isLoading: isLoadingPresupuestos } =
    useGetPresupuestos();

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
