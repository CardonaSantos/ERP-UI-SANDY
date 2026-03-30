import z from "zod";

import { FieldConfig } from "../dynamictEntityForm/dynamicForm";
import { SelectOption } from "../presupuestos/form/presupuesto-form";

// ── PRESUPUESTO ────────────────────────────────────────────────────────────

interface generarOptions {
  periodos: SelectOption[];

  centros: SelectOption[];
  partidas: SelectOption[];
}

export const presupuestoSchema = z.object({
  periodoId: z.number({ error: "Selecciona un periodo" }),
  centroCostoId: z.number({ error: "Selecciona un centro de costo" }),
  partidaId: z.number({ error: "Selecciona una partida" }),
  montoAsignado: z
    .number({ error: "Ingresa un número" })
    .positive("Debe ser mayor a 0"),
});
export function generarOptions({
  centros,
  partidas,
  periodos,
}: generarOptions) {
  const presupuestoConfig: FieldConfig[] = [
    {
      name: "periodoId",
      label: "Periodo",
      type: "select",
      placeholder: "Seleccionar periodo...",
      options: periodos,
    },
    {
      name: "centroCostoId",
      label: "Centro de Costo",
      type: "select",
      placeholder: "Seleccionar centro...",
      options: centros,
    },
    {
      name: "partidaId",
      label: "Partida Presupuestaria",
      type: "select",
      placeholder: "Seleccionar partida...",
      className: "sm:col-span-2", // ocupa las 2 columnas
      options: partidas,
    },
    {
      name: "montoAsignado",
      label: "Monto Asignado (GTQ)",
      type: "number",
      placeholder: "0.00",
      className: "sm:col-span-2",
    },
  ];

  return presupuestoConfig;
}

// ── PARTIDA PRESUPUESTAL ────────────────────────────────────────────────────────────

export const partidaConfig: FieldConfig[] = [
  { name: "codigo", label: "Código", type: "text", placeholder: "Ej. 1001" },
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
    placeholder: "Nombre de la partida",
  },

  {
    name: "descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Opcional",
  },
];

export const partidaSchema = z.object({
  codigo: z.string().min(1, "Código requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
});

// ── PERIODO ────────────────────────────────────────────────────────────

export const periodoConfig: FieldConfig[] = [
  {
    name: "nombre",
    label: "Nombre del Periodo",
    type: "text",
    placeholder: "Ej. Enero 2025",
  },
  {
    name: "descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Notas opcionales…",
  },
  { name: "fechaInicio", label: "Fecha de Inicio", type: "date" },
  { name: "fechaFin", label: "Fecha de Cierre", type: "date" },
  { name: "cerrado", label: "Cerrado", type: "boolean" },
];

export const periodoSchema = z
  .object({
    nombre: z.string().min(1, "Nombre requerido"),
    descripcion: z.string().optional(),
    fechaInicio: z.date({ error: "Fecha requerida" }),
    fechaFin: z.date({ error: "Fecha requerida" }),
    cerrado: z.boolean().default(false),
  })
  .refine((d) => d.fechaFin > d.fechaInicio, {
    message: "Fecha de cierre debe ser posterior al inicio",
    path: ["fechaFin"],
  });

// ── Centro de Costo ────────────────────────────────────────────────────────────

export const centroCostoSchema = z.object({
  codigo: z.string().max(20, "Máximo 20 caracteres").optional(),
  nombre: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),
  sucursalId: z.number({ error: "La sucursal es obligatoria" }),
});

export const centroCostoConfig = (
  sucursalOptions: SelectOption[],
): FieldConfig[] => [
  {
    name: "codigo",
    label: "Código",
    type: "text",
    placeholder: "Ej. CC-001",
  },
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
    placeholder: "Nombre del centro de costo",
  },
  {
    name: "sucursalId",
    label: "Sucursal",
    type: "select",
    placeholder: "Seleccionar sucursal...",
    options: sucursalOptions,
  },
];
