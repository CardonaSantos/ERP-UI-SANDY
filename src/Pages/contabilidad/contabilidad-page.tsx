"use client";

import { useState } from "react";
import { BookOpen, GitBranch, Layers, FlaskConical } from "lucide-react";
import { useGetCuentasContables } from "@/hooks/contabilidad/cuentas-contables.hooks";
import { CuentasContables } from "./cuentas/CuentasContables";
import { ReglasContables } from "./reglas/ReglasContables";
import { SimuladorReglas } from "./simulador/SimuladorReglas";
import { AsientosContables } from "./asientos/AsientosContables";
import { useSearchParams } from "react-router-dom";
import { useTabChangeWithUrl } from "@/utils/components/tabs/handleTabChangeWithParamURL";
import { ReusableTabs, TabItem } from "@/utils/components/tabs/reusable-tabs";
import ExcelContabilidadReports from "./excel-reports/excel-contabilidad-report";
import { useGetProveedores } from "@/hooks/getProveedoresSelect/proveedores";
import { useClientes } from "@/hooks/use-clientes/use-clientes";
import { useGetUsersSelect } from "@/hooks/use-users/use-users";
import { useGetCuentasBancarias } from "@/hooks/use-cuentas-bancarias/use-cuentas-bancarias";
import { useGetSucursalesList } from "@/hooks/getSucursales/use-sucursales";
import {
  useGetBalanceComprobacion,
  useGetEstadoBancario,
  useGetEstadoCajaTurno,
  useGetEstadoCuentaCliente,
  useGetEstadoCuentaContable,
  useGetEstadoCuentaProveedor,
  useGetEstadoResultados,
  useGetFlujoCaja,
  useGetLibroDiario,
  useGetLibroMayor,
  useGetMovimientosSinAsiento,
  useGetReporteGastos,
  useGetReporteReglasContables,
  useGetReporteVentas,
} from "@/hooks/use-reports/use-report-excel";

export default function ContabilidadPage() {
  // const [activeTab, setActiveTab] = useState<Tab>("cuentas");
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get("tab") as string) || "cuentas";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  // Fetch cuentas at the top level so reglas and simulador can use them

  const { data: proveedores } = useGetProveedores();
  const { data: clientes } = useClientes();
  const { data: users } = useGetUsersSelect();
  const { data: cuentasBancarias } = useGetCuentasBancarias();
  const { data: sucursales } = useGetSucursalesList();

  console.log("Las sucursales del hook son: ", sucursales);

  const provList = proveedores ? proveedores : [];
  const clientesList = clientes ? clientes : [];
  const sucursalesList = sucursales ? sucursales : [];
  const cuentasBancariasList = cuentasBancarias ? cuentasBancarias : [];
  const usersList = users ? users : [];
  const { data: cuentas } = useGetCuentasContables();
  const cuentasList = cuentas ?? [];
  const handleChangeTabs = useTabChangeWithUrl({
    activeTab,
    setActiveTab,
    searchParams,
    setSearchParams,
  });

  const balanceComprobacion = useGetBalanceComprobacion();
  const libroDiario = useGetLibroDiario();
  const libroMayor = useGetLibroMayor();
  const estadoResultados = useGetEstadoResultados();
  const flujoCaja = useGetFlujoCaja();
  const estadoCajaTurno = useGetEstadoCajaTurno();
  const estadoCuentaContable = useGetEstadoCuentaContable();
  const estadoCuentaCliente = useGetEstadoCuentaCliente();
  const estadoCuentaProveedor = useGetEstadoCuentaProveedor();
  const reporteVentas = useGetReporteVentas();
  const reporteGastos = useGetReporteGastos();
  const reporteReglasContables = useGetReporteReglasContables();
  const movimientosSinAsiento = useGetMovimientosSinAsiento();
  const estadoBancario = useGetEstadoBancario();

  const reportHooks = {
    balanceComprobacion: {
      mutateAsync: balanceComprobacion.mutateAsync,
      isPending: balanceComprobacion.isPending,
    },
    libroDiario: {
      mutateAsync: libroDiario.mutateAsync,
      isPending: libroDiario.isPending,
    },
    libroMayor: {
      mutateAsync: libroMayor.mutateAsync,
      isPending: libroMayor.isPending,
    },
    estadoResultados: {
      mutateAsync: estadoResultados.mutateAsync,
      isPending: estadoResultados.isPending,
    },
    flujoCaja: {
      mutateAsync: flujoCaja.mutateAsync,
      isPending: flujoCaja.isPending,
    },
    estadoCajaTurno: {
      mutateAsync: estadoCajaTurno.mutateAsync,
      isPending: estadoCajaTurno.isPending,
    },
    estadoCuentaContable: {
      mutateAsync: estadoCuentaContable.mutateAsync,
      isPending: estadoCuentaContable.isPending,
    },
    estadoCuentaCliente: {
      mutateAsync: estadoCuentaCliente.mutateAsync,
      isPending: estadoCuentaCliente.isPending,
    },
    estadoCuentaProveedor: {
      mutateAsync: estadoCuentaProveedor.mutateAsync,
      isPending: estadoCuentaProveedor.isPending,
    },
    reporteVentas: {
      mutateAsync: reporteVentas.mutateAsync,
      isPending: reporteVentas.isPending,
    },
    reporteGastos: {
      mutateAsync: reporteGastos.mutateAsync,
      isPending: reporteGastos.isPending,
    },
    reporteReglasContables: {
      mutateAsync: reporteReglasContables.mutateAsync,
      isPending: reporteReglasContables.isPending,
    },
    movimientosSinAsiento: {
      mutateAsync: movimientosSinAsiento.mutateAsync,
      isPending: movimientosSinAsiento.isPending,
    },
    estadoBancario: {
      mutateAsync: estadoBancario.mutateAsync,
      isPending: estadoBancario.isPending,
    },
  };

  const dataTabs: Array<TabItem> = [
    {
      content: <CuentasContables />,
      label: "Plan de cuentas",
      value: "cuentas",
      icon: <BookOpen size={15} />,
    },

    {
      content: <ReglasContables cuentas={cuentasList} />,
      label: "Reglas contables",
      value: "reglas-contables",
      icon: <GitBranch size={15} />,
    },

    {
      content: <SimuladorReglas cuentas={cuentasList} />,
      label: "Simulador",
      value: "simulador-operaciones",
      icon: <FlaskConical size={15} />,
    },

    {
      content: <AsientosContables cuentas={cuentasList} />,
      label: "Asientos Contables",
      value: "asientos-contables",
      icon: <Layers size={15} />,
    },

    {
      content: (
        <ExcelContabilidadReports
          clientesList={clientesList}
          cuentasBancariasList={cuentasBancariasList}
          proveedoresList={provList}
          sucursalesList={sucursalesList}
          usersList={usersList}
          cuentasList={cuentasList}
          hooks={reportHooks}
        />
      ),
      label: "Reportes Contabilidad Excel",
      value: "contabilidad-excel-reportes",
      icon: <Layers size={15} />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Módulo de Contabilidad
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Parametrización contable del ERP
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">
              Sistema activo
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Content */}
        <ReusableTabs
          tabs={dataTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className=""
          defaultValue={defaultTab}
          handleTabChange={handleChangeTabs}
          variant="compact"
        />
      </main>
    </div>
  );
}
