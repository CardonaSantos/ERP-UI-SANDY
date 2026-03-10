export const plantillaLegalQkeys = {
  all: ["plantilla-legal"] as const,
  byId: (id: number) => ["plantilla-legal", id] as const,
};
