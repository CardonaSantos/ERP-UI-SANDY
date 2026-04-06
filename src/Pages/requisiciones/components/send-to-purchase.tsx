"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { TriangleAlert, Loader2, LandmarkIcon } from "lucide-react";
import {
  RequisitionResponseDTO,
  SendToComprasDTO,
} from "@/Types/requisiciones/requisiciones-tables";
import { PresupuestoPartidaSelect } from "@/Types/costos presupuestales/selects";
import { ReusableSelect } from "@/utils/components/ReactSelectComponent/ReusableSelect";

// ============================================================
// Tipos locales
// ============================================================

export interface ProveedorOption {
  id: number;
  nombre: string;
  telefonoContacto?: string | null;
}

/** Partida presupuestal / Centro de costo  */
export interface PartidaPresupuestal {
  id: string;
  nombre: string;
  codigoContable: string;
  saldoDisponible?: number;
}

interface SendToPurchasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisicion: RequisitionResponseDTO | null;
  proveedores: ProveedorOption[];
  partidas: Array<PresupuestoPartidaSelect>;
  isPending: boolean;
  onConfirm: (
    dto: SendToComprasDTO & { partidaPresupuestalId: string },
  ) => void;
}

// ============================================================
// Formatters
// ============================================================

const formatMoneda = (n: number) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
    n,
  );

// ============================================================
// Component
// ============================================================

export function SendToPurchasesDialog({
  open,
  onOpenChange,
  requisicion,
  proveedores,
  partidas,
  isPending,
  onConfirm,
}: SendToPurchasesDialogProps) {
  const [proveedorId, setProveedorId] = useState<string>("");
  const [partidaId, setPartidaId] = useState<string>("");

  const canConfirm = !!proveedorId && !!partidaId && !isPending;

  const handleConfirm = () => {
    if (!requisicion || !canConfirm) return;
    onConfirm({
      requisicionID: requisicion.id,
      userID: requisicion.usuarioId,
      proveedorId: parseInt(proveedorId, 10),
      partidaPresupuestalId: partidaId,
    });
  };

  const handleOpenChange = (value: boolean) => {
    if (!isPending) {
      if (!value) {
        setProveedorId("");
        setPartidaId("");
      }
      onOpenChange(value);
    }
  };

  const selectedPartida = partidas.find((p) => p.id === parseInt(partidaId));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {/* ── Header ───────────────────────────────────────── */}
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Enviar a módulo de compras
          </DialogTitle>
          <DialogDescription className="text-xs">
            Folio:{" "}
            <span className="font-mono font-medium">
              {requisicion?.folio ?? "—"}
            </span>{" "}
            · Total:{" "}
            <span className="font-medium">
              {requisicion ? formatMoneda(requisicion.totalRequisicion) : "—"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* ── Advertencia presupuestal ──────────────────── */}
          <Alert variant="destructive" className="py-2.5">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold mb-0.5">
              Acción irreversible — compromete presupuesto
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              Al confirmar, el sistema ejecutará el método{" "}
              <strong>comprometer saldo</strong> sobre la partida presupuestal
              seleccionada. Esta requisición no podrá editarse ni eliminarse una
              vez enviada.
            </AlertDescription>
          </Alert>

          <Separator />

          {/* ── Proveedor ─────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Proveedor</Label>
            <Select
              value={proveedorId}
              onValueChange={setProveedorId}
              disabled={isPending}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Seleccionar proveedor..." />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={String(p.id)}
                    className="text-xs"
                  >
                    {p.nombre}
                    {p.telefonoContacto ? ` (${p.telefonoContacto})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Partida presupuestal ──────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1">
              <LandmarkIcon className="h-3.5 w-3.5" />
              Partida presupuestal / Centro de costo
            </Label>

            <ReusableSelect
              items={partidas}
              // Retornamos el ID único (es number según tu interfaz)
              getValue={(p) => p.id}
              // Lo que el usuario verá en la lista
              getLabel={(p) =>
                `${p.partida} — Disp. ${formatMoneda(p.montoDisponible)}`
              }
              // Buscamos el objeto completo basado en tu partidaId del estado
              value={partidas.find((p) => String(p.id) === partidaId) || null}
              // Al cambiar, actualizamos tu estado de string
              onChange={(p) => setPartidaId(p ? String(p.id) : "")}
              placeholder="Seleccionar partida..."
              isClearable={true}
              // Podemos pasar estilos o props adicionales de react-select aquí
              selectProps={{
                isDisabled: isPending,
                noOptionsMessage: () => "No hay partidas disponibles",
                // Estilos para que combine con tu diseño (opcional)
                styles: {
                  control: (base) => ({
                    ...base,
                    minHeight: "32px",
                    height: "32px",
                    fontSize: "12px",
                  }),
                },
              }}
            />

            {/* Saldo disponible inline (tu lógica actual sigue funcionando igual) */}
            {selectedPartida && (
              <p className="text-[11px] text-muted-foreground">
                Saldo disponible:{" "}
                <span className="font-medium text-foreground">
                  {formatMoneda(selectedPartida.montoDisponible)}
                </span>
                {requisicion &&
                  selectedPartida.montoDisponible <
                    requisicion.totalRequisicion && (
                    <span className="ml-2 text-destructive font-medium">
                      Saldo insuficiente
                    </span>
                  )}
              </p>
            )}
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button size="sm" disabled={!canConfirm} onClick={handleConfirm}>
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Enviando...
              </>
            ) : (
              "Confirmar y comprometer saldo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
