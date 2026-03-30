"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetCentrosCosto,
  useGetPartidas,
  useGetPeriodos,
} from "@/hooks/use-costos-presupuestales/use-costos-presupuestales";
import {
  usePostCentroCosto,
  usePostPartida,
  usePostPeriodo,
  usePostPresupuesto,
} from "@/hooks/use-costos-presupuestales/main-posts";
import { PageTransition } from "@/components/Transition/layout-transition";
import DynamicEntityForm from "../../dynamictEntityForm/dynamicForm";
import {
  centroCostoConfig,
  centroCostoSchema,
  generarOptions,
  partidaConfig,
  partidaSchema,
  periodoConfig,
  periodoSchema,
  presupuestoSchema,
} from "../../schemas/form-schemas";
import useGetSucursales from "@/hooks/getSucursales/use-sucursales";

export type SelectOption = { value: number; label: string };

// ── Section wrapper ────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  description: string;
  accent: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FormSection({
  title,
  description,
  accent,
  defaultOpen = false,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3
                   bg-muted/40 hover:bg-muted/70 transition-colors duration-100
                   text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="size-1.5 rounded-full shrink-0"
            style={{ backgroundColor: accent }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {title}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {description}
            </p>
          </div>
        </div>
        <ChevronRight
          className={cn(
            "size-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 py-4 border-t border-border/50 bg-background">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function CreatePresupuestoForm() {
  const { data: periodos } = useGetPeriodos();
  const { data: centros } = useGetCentrosCosto();
  const { data: partidas } = useGetPartidas();
  const { data: sucursales } = useGetSucursales();

  const periodoOptions: SelectOption[] = (periodos ?? []).map((p) => ({
    value: p.id,
    label: `${p.nombre} — ${p.estado}`,
  }));

  const centroOptions: SelectOption[] = (centros ?? [])
    .filter((c) => c.activo)
    .map((c) => ({ value: c.id, label: `${c.codigo} · ${c.nombre}` }));

  const partidaOptions: SelectOption[] = (partidas ?? []).map((p) => ({
    value: p.id,
    label: `${p.codigo} · ${p.nombre}`,
  }));

  const sucursalOptions: SelectOption[] = (sucursales ?? []).map((s) => ({
    value: s.id,
    label: s.nombre,
  }));

  return (
    <PageTransition titleHeader="Crear presupuesto" fallbackBackTo="/">
      {/* Page header */}
      <div className="mb-5">
        <p className="text-[12px] text-muted-foreground">
          Gestiona presupuestos, partidas y periodos desde aquí.
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3">
        <FormSection
          title="Nuevo presupuesto"
          description="Asigna monto a un centro de costo y partida"
          accent="#378ADD"
          defaultOpen
        >
          <DynamicEntityForm
            mutationHook={usePostPresupuesto}
            onSuccess={() => toast.success("Presupuesto creado")}
            config={generarOptions({
              centros: centroOptions,
              partidas: partidaOptions,
              periodos: periodoOptions,
            })}
            validationSchema={presupuestoSchema}
            submitLabel="Crear presupuesto"
            columns={2}
          />
        </FormSection>

        <FormSection
          title="Nueva partida presupuestal"
          description="Código, nombre y descripción de la partida"
          accent="#1D9E75"
        >
          <DynamicEntityForm
            mutationHook={usePostPartida}
            onSuccess={() => toast.success("Partida creada")}
            config={partidaConfig}
            validationSchema={partidaSchema}
            submitLabel="Crear partida"
          />
        </FormSection>

        <FormSection
          title="Nuevo periodo"
          description="Nombre, fechas y estado del periodo contable"
          accent="#BA7517"
        >
          <DynamicEntityForm
            mutationHook={usePostPeriodo}
            onSuccess={() => toast.success("Periodo creado")}
            config={periodoConfig}
            validationSchema={periodoSchema}
            submitLabel="Crear periodo"
          />
        </FormSection>

        <FormSection
          title="Nuevo centro de costo"
          description="Código, nombre y sucursal asignada"
          accent="#7F77DD"
        >
          <DynamicEntityForm
            mutationHook={usePostCentroCosto}
            onSuccess={() => toast.success("Centro de costo creado")}
            config={centroCostoConfig(sucursalOptions)}
            validationSchema={centroCostoSchema}
            submitLabel="Crear centro de costo"
            columns={2}
          />
        </FormSection>
      </div>
    </PageTransition>
  );
}
