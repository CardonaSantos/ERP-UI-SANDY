export const requisicionesQkeys = {
  all: ["requisiciones"] as const,
  detail: (id: number) => [...requisicionesQkeys.all, "detail", id] as const,
  toEdit: (id: number) => [...requisicionesQkeys.all, "edit", id] as const,
  preview: (sucursalId: number) =>
    [...requisicionesQkeys.all, "preview", sucursalId] as const,
};
