import { PageTransition } from "@/components/Transition/layout-transition";
import { ReusableTabs, TabItem } from "@/utils/components/tabs/reusable-tabs";
import React, { useState } from "react";
import {
  LayoutDashboard, // Para la vista principal
  ListChecks, // Para las partidas
  CalendarDays, // Para los periodos
  FileText, // Para un posible tab de reportes o auditoría
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
  const { data: partidas = [], isLoading: isLoadingPartidas } =
    useGetPartidas();
  const { data: periodos = [], isLoading: isLoadingPeriodos } =
    useGetPeriodos();

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
      // Pasamos la data como prop para que el hijo no tenga que esperar
      content: (
        <PresupuestosDashboard
          data={presupuestos}
          isLoading={isLoadingPresupuestos}
        />
      ),
    },
    {
      label: "Partidas",
      value: "partidas",
      icon: <ListChecks size={18} />,
      content: (
        <PartidasCatalogo data={partidas} isLoading={isLoadingPartidas} />
      ),
    },
    {
      label: "Periodos",
      value: "periodos",
      icon: <CalendarDays size={18} />,
      content: (
        <PeriodosCalendario data={periodos} isLoading={isLoadingPeriodos} />
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
