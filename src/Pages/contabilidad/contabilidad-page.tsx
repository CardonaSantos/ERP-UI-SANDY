"use client";

import { useState } from "react";
import { BookOpen, GitBranch, Layers, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCuentasContables } from "@/hooks/contabilidad/cuentas-contables.hooks";
import { CuentasContables } from "./cuentas/CuentasContables";
import { ReglasContables } from "./reglas/ReglasContables";
import { SimuladorReglas } from "./simulador/SimuladorReglas";
import { AsientosContables } from "./asientos/AsientosContables";

type Tab = "cuentas" | "reglas" | "simulador" | "asientos";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: "cuentas",
    label: "Plan de Cuentas",
    icon: <BookOpen className="h-3.5 w-3.5" />,
    description: "Catálogo base del plan contable",
  },
  {
    id: "reglas",
    label: "Reglas Contables",
    icon: <GitBranch className="h-3.5 w-3.5" />,
    description: "Motor de automatización contable",
  },
  {
    id: "simulador",
    label: "Simulador",
    icon: <FlaskConical className="h-3.5 w-3.5" />,
    description: "Prueba reglas antes de registrar",
  },
  {
    id: "asientos",
    label: "Asientos",
    icon: <Layers className="h-3.5 w-3.5" />,
    description: "Historial generado por el sistema",
  },
];

export default function ContabilidadPage() {
  const [activeTab, setActiveTab] = useState<Tab>("cuentas");

  // Fetch cuentas at the top level so reglas and simulador can use them
  const { data: cuentas } = useGetCuentasContables();
  const cuentasList = cuentas ?? [];

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

      {/* Flow hint */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto">
          <span>Flujo sugerido:</span>
          <span className="text-foreground font-medium">1. Cuentas</span>
          <span>→</span>
          <span className="text-foreground font-medium">2. Reglas</span>
          <span>→</span>
          <span className="text-foreground font-medium">3. Simulación</span>
          <span>→</span>
          <span className="text-foreground font-medium">
            4. Revisar asientos
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Tabs */}
        <nav className="flex items-center gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab description */}
        <p className="text-xs text-muted-foreground">
          {TABS.find((t) => t.id === activeTab)?.description}
        </p>

        {/* Content */}
        <div>
          {activeTab === "cuentas" && <CuentasContables />}
          {activeTab === "reglas" && <ReglasContables cuentas={cuentasList} />}
          {activeTab === "simulador" && (
            <SimuladorReglas cuentas={cuentasList} />
          )}
          {activeTab === "asientos" && (
            <AsientosContables cuentas={cuentasList} />
          )}
        </div>
      </main>
    </div>
  );
}
