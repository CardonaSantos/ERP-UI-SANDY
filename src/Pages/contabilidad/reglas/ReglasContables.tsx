"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// import {
//   CuentaContable,
//   CreateReglaContableDto,
//   ReglaContable,
//   UpdateReglaContableDto,
// } from "@/lib/contabilidad/entity-types";
import { BadgeActiva, EmptyState, LoadingRows } from "../shared/badges";
import { ReglaContableForm } from "./ReglaContableForm";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import {
  useCreateReglaContable,
  useDeleteReglaContable,
  useGetReglasContables,
  useUpdateReglaContable,
} from "@/hooks/contabilidad/regla-contable.hooks";
import { ReglaContable } from "@/Types/contabilidad/regla-contable/regla-contable";
import {
  CreateReglaContableDto,
  UpdateReglaContableDto,
} from "@/Types/contabilidad/mutations-types/mutations-types";
import { ORIGENES_ASIENTO } from "@/Types/contabilidad/origen";
// import {
//   useGetReglasContables,
//   useCreateReglaContable,
//   useUpdateReglaContable,
//   useDeleteReglaContable,
// } from "@/lib/contabilidad/hooks";
// import { ORIGENES_ASIENTO } from "@/lib/contabilidad/types-enums";

interface Props {
  cuentas: CuentaContable[];
}

export function ReglasContables({ cuentas }: Props) {
  const { data: reglas, isLoading } = useGetReglasContables();
  const createMutation = useCreateReglaContable();

  const [editTarget, setEditTarget] = useState<ReglaContable | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReglaContable | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterOrigen, setFilterOrigen] = useState("");

  const updateMutation = useUpdateReglaContable(editTarget?.id ?? 0);
  const deleteMutation = useDeleteReglaContable(deleteTarget?.id ?? 0);

  const lista = (reglas ?? [])
    .filter((r) => !filterOrigen || r.origen === filterOrigen)
    .sort((a, b) => a.prioridad - b.prioridad);

  function getCuentaNombre(id: number) {
    const c = cuentas.find((c) => c.id === id);
    return c ? `${c.codigo} ${c.nombre}` : `ID:${id}`;
  }

  function handleCreate(data: CreateReglaContableDto) {
    createMutation.mutate(data, { onSuccess: () => setShowCreate(false) });
  }

  function handleUpdate(data: UpdateReglaContableDto) {
    updateMutation.mutate(data, { onSuccess: () => setEditTarget(null) });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(undefined as unknown as void, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Reglas Contables</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {(reglas ?? []).length} reglas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterOrigen}
            onChange={(e) => setFilterOrigen(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos los orígenes</option>
            {ORIGENES_ASIENTO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-3 w-3" />
            Nueva regla
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Prioridad
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Código
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Nombre
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Origen
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Clasificación
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Debe
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Haber
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Estado
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <LoadingRows cols={9} />
            ) : lista.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState message="No hay reglas contables registradas." />
                </td>
              </tr>
            ) : (
              lista.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-center">
                    <span className="inline-flex items-center justify-center h-5 w-6 rounded bg-muted text-xs font-mono font-medium text-foreground">
                      {r.prioridad}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground">
                    {r.codigo}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    <span>{r.nombre}</span>
                    {r.descripcion && (
                      <p className="text-muted-foreground truncate max-w-[140px]">
                        {r.descripcion}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {ORIGENES_ASIENTO.find((o) => o.value === r.origen)
                      ?.label ?? r.origen}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.clasificacion ?? (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-foreground truncate max-w-[120px]">
                    {getCuentaNombre(r.cuentaDebeId)}
                  </td>
                  <td className="px-3 py-2 text-foreground truncate max-w-[120px]">
                    {getCuentaNombre(r.cuentaHaberId)}
                  </td>
                  <td className="px-3 py-2">
                    <BadgeActiva activa={r.activa} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setEditTarget(r)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(r)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Nueva Regla Contable</DialogTitle>
          </DialogHeader>
          <ReglaContableForm
            cuentas={cuentas}
            reglas={reglas ?? []}
            isPending={createMutation.isPending}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Editar Regla Contable</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <ReglaContableForm
              cuentas={cuentas}
              reglas={reglas ?? []}
              initialData={editTarget}
              isPending={updateMutation.isPending}
              onSubmit={(data) => handleUpdate({ ...data, id: editTarget.id })}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Eliminar regla</DialogTitle>
            <DialogDescription className="text-xs">
              ¿Eliminar la regla{" "}
              <strong>
                {deleteTarget?.codigo} — {deleteTarget?.nombre}
              </strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="h-7 text-xs">Cancelar</Button>
            <Button
              className="h-7 text-xs bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
