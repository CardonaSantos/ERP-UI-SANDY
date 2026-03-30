import z from "zod";

export const schemaPresupuestoCrear = z.object({
  periodoId: z.number({ error: "Requerido" }).min(1, "Selecciona un periodo"),
  centroCostoId: z
    .number({ error: "Requerido" })
    .min(1, "Selecciona un centro de costo"),
  partidaId: z.number({ error: "Requerido" }).min(1, "Selecciona una partida"),
  montoAsignado: z
    .number({ error: "Requerido" })
    .min(0, "El monto debe ser mayor o igual a 0"),
});

export type FormValuesPresupuestoCrear = z.infer<typeof schemaPresupuestoCrear>;
