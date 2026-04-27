"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BadgeActiva,
  BadgeNaturaleza,
  BadgeTipoCuenta,
  EmptyState,
  LoadingRows,
} from "../shared/badges";
import { CuentaContableForm } from "./CuentaContableForm";
import {
  useCreateCuentaContable,
  useDeleteCuentaContable,
  useGetCuentasContables,
  useUpdateCuentaContable,
} from "@/hooks/contabilidad/cuentas-contables.hooks";
import { CuentaContable } from "@/Types/contabilidad/cuenta-contable/cuentas-contables";
import {
  CreateCuentaContableDto,
  UpdateCuentaContableDto,
} from "@/Types/contabilidad/mutations-types/mutations-types";

export function CuentasContables() {
  const { data: cuentas, isLoading } = useGetCuentasContables();
  const createMutation = useCreateCuentaContable();

  const [editTarget, setEditTarget] = useState<CuentaContable | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CuentaContable | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("");

  const updateMutation = useUpdateCuentaContable(editTarget?.id ?? 0);
  const deleteMutation = useDeleteCuentaContable(deleteTarget?.id ?? 0);

  const lista = (cuentas ?? []).filter(
    (c) =>
      filter === "" ||
      c.codigo.toLowerCase().includes(filter.toLowerCase()) ||
      c.nombre.toLowerCase().includes(filter.toLowerCase()),
  );

  function handleCreate(data: CreateCuentaContableDto) {
    createMutation.mutate(data, { onSuccess: () => setShowCreate(false) });
  }

  function handleUpdate(data: UpdateCuentaContableDto) {
    updateMutation.mutate(data, { onSuccess: () => setEditTarget(null) });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(undefined as unknown as void, {
      onSuccess: () => setDeleteTarget(null),
    });
  }
  console.log("Las cuentas son: ", cuentas);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Plan de Cuentas</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {(cuentas ?? []).length} cuentas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filtrar por código o nombre..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-52"
          />
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-3 w-3" />
            Nueva cuenta
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Código
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Nombre
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Tipo
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Naturaleza
              </th>
              {/* <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Nivel
              </th> */}
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Mov.
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
              <LoadingRows cols={8} />
            ) : lista.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState message="No hay cuentas contables registradas." />
                </td>
              </tr>
            ) : (
              lista.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-mono text-foreground">
                    {c.codigo}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    <span style={{ paddingLeft: `${(c.nivel - 1) * 12}px` }}>
                      {c.nombre}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <BadgeTipoCuenta tipo={c.tipo} />
                  </td>
                  <td className="px-3 py-2">
                    <BadgeNaturaleza naturaleza={c.naturaleza} />
                  </td>
                  {/* <td className="px-3 py-2 text-muted-foreground">{c.nivel}</td> */}
                  <td className="px-3 py-2 text-muted-foreground">
                    {c.permiteMovimiento ? (
                      <span className="text-emerald-600">Sí</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <BadgeActiva activa={c.activo} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setEditTarget(c)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(c)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Nueva Cuenta Contable</DialogTitle>
          </DialogHeader>
          <CuentaContableForm
            cuentas={cuentas ?? []}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Editar Cuenta Contable
            </DialogTitle>
          </DialogHeader>
          {editTarget && (
            <CuentaContableForm
              cuentas={(cuentas ?? []).filter((c) => c.id !== editTarget.id)}
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
            <DialogTitle className="text-sm">Eliminar cuenta</DialogTitle>
            <DialogDescription className="text-xs">
              ¿Eliminar{" "}
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
