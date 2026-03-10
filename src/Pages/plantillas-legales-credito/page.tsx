import { useState } from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  LayoutTemplate,
  AlertTriangle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useDeletePlantillaLegal,
  usePlantillasLegales,
} from "@/hooks/use-plantillas-legales/use-plantillas-legales";
import { PlantillaLegalCredito } from "@/features/plantillas-legales";
import { plantillaLegalQkeys } from "@/hooks/use-plantillas-legales/Qk";
import { formattFechaWithMinutes } from "../Utils/Utils";
import { PageHeader } from "@/utils/components/PageHeaderPos";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import { Link } from "react-router-dom";

// ── Helpers ────────────────────────────────────────────────────────────────
const TIPO_LABEL: Record<string, string> = {
  CONTRATO_CREDITO: "Contrato crédito",
  PAGARE: "Pagaré",
  CARTA_COMPROMISO: "Carta compromiso",
  AVISO_PRIVACIDAD: "Aviso privacidad",
};

function TipoBadge({ tipo }: { tipo: string }) {
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
      {TIPO_LABEL[tipo] ?? tipo}
    </Badge>
  );
}

function EstadoBadge({ activa }: { activa: boolean }) {
  return activa ? (
    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500">
      <CheckCircle2 className="h-3 w-3" /> Activa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <XCircle className="h-3 w-3" /> Inactiva
    </span>
  );
}

// ── Skeleton row ───────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-7 w-16 rounded-md" />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
function PlantillasLegales() {
  const queryClient = useQueryClient();
  const { data: plantillas, isLoading, isError } = usePlantillasLegales();
  const deleteMutation = useDeletePlantillaLegal();

  const [toDelete, setToDelete] = useState<PlantillaLegalCredito | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    toast.promise(
      deleteMutation.mutateAsync(
        { id: toDelete.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: plantillaLegalQkeys.all,
            });
            toast.success(`Plantilla "${toDelete.nombre}" eliminada`);
            setToDelete(null);
          },
          onError: () => {
            toast.error("Error al eliminar la plantilla");
            setToDelete(null);
          },
        },
      ),
      {
        success: "Registro eliminado",
        loading: "Registrando...",
        error: (error) => getApiErrorMessageAxios(error),
      },
    );
  }

  const activas = plantillas?.filter((p) => p.activa).length ?? 0;
  const inactivas = (plantillas?.length ?? 0) - activas;

  function onNavigateCreate(): void {
    throw new Error("Function not implemented.");
  }

  function onNavigateEdit(id: number): void {
    console.log(id);
  }

  return (
    <div className="mx-auto px-4 py-6 space-y-4">
      <PageHeader
        title="Plantillas Legales"
        fallbackBackTo="/"
        sticky={false}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10">
            <LayoutTemplate className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">
              Plantillas legales
            </h1>
            <p className="text-xs text-muted-foreground">
              Gestión de plantillas para contratos de crédito
            </p>
          </div>
        </div>
        <Link to={"/plantillas-legales/nueva"}>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onNavigateCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva plantilla
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total",
            value: plantillas?.length ?? 0,
            color: "text-foreground",
          },
          { label: "Activas", value: activas, color: "text-emerald-500" },
          {
            label: "Inactivas",
            value: inactivas,
            color: "text-muted-foreground",
          },
        ].map((s) => (
          <Card key={s.label} className="py-0">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {s.label}
              </p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden p-0">
        <CardHeader className="px-4 py-2.5 border-b border-border bg-muted/30 flex-row items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Registros
          </span>
          <span className="text-[10px] text-muted-foreground">
            {plantillas?.length ?? 0} plantilla(s)
          </span>
        </CardHeader>

        {/* Loading */}
        {isLoading && (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="text-xs">Error al cargar las plantillas</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && plantillas?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <FileText className="h-8 w-8 opacity-30" />
            <div className="text-center">
              <p className="text-xs font-medium">Sin plantillas registradas</p>
              <p className="text-[10px] mt-0.5">
                Crea tu primera plantilla para comenzar
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={onNavigateCreate}
            >
              <Plus className="h-3 w-3" /> Crear plantilla
            </Button>
          </div>
        )}

        {/* Rows */}
        {!isLoading && !isError && (plantillas?.length ?? 0) > 0 && (
          <div className="divide-y divide-border">
            {plantillas!.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
              >
                {/* Icon */}
                <div className="shrink-0 h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium truncate">
                      {p.nombre}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      v{p.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <TipoBadge tipo={p.tipo} />
                    <span className="text-[10px] text-muted-foreground">
                      {formattFechaWithMinutes(p.creadoEn)}
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <EstadoBadge activa={p.activa} />

                {/* Acciones */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onNavigateEdit(p.id)}
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setToDelete(p)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onNavigateEdit(p.id)}
                    title="Ver detalle"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Dialog eliminar */}
      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Eliminar plantilla
            </DialogTitle>
            <DialogDescription className="text-xs">
              Estás por eliminar{" "}
              <span className="font-semibold text-foreground">
                "{toDelete?.nombre}"
              </span>
              . Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PlantillasLegales;
