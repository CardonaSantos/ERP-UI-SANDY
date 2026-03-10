export const contratoRenderQkeys = {
  byIds: (ventaCuotaId: number, plantillaId: number) =>
    ["contrato-render", ventaCuotaId, plantillaId] as const,
};
