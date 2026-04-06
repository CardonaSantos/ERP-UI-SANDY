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
import { TriangleAlert, Loader2 } from "lucide-react";
import {
  RequisitionResponseDTO,
  SendToComprasDTO,
} from "@/Types/requisiciones/requisiciones-tables";
import { PresupuestoPartidaSelect } from "@/Types/costos presupuestales/selects";
import { ReusableSelect } from "@/utils/components/ReactSelectComponent/ReusableSelect";
import { formatMonedaGT } from "@/Pages/Compras/compras.utils";

export interface ProveedorOption {
  id: number;
  nombre: string;
  telefonoContacto?: string | null;
}

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
  onConfirm: (dto: SendToComprasDTO) => void;
}

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
      presupuestoId: parseInt(partidaId),
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
              {requisicion ? formatMonedaGT(requisicion.totalRequisicion) : "—"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <Alert variant="destructive" className="py-2.5">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold mb-0.5">
              Confirmación de compromiso presupuestario
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              Al confirmar, se reservará y comprometerá el saldo de la partida
              seleccionada de forma inmediata.
            </AlertDescription>
          </Alert>

          <Separator />

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
              Partida presupuestal / Centro de costo
            </Label>

            <ReusableSelect
              items={partidas}
              getValue={(p) => p.id}
              getLabel={(p) => {
                const usable = p.montoDisponible - p.montoComprometido;
                return `${p.partida} • Saldo: ${formatMonedaGT(usable)} (Disp: ${formatMonedaGT(p.montoDisponible)} | Comp: ${formatMonedaGT(p.montoComprometido)})`;
              }}
              value={partidas.find((p) => String(p.id) === partidaId) || null}
              onChange={(p) => setPartidaId(p ? String(p.id) : "")}
              placeholder="Seleccionar partida..."
              isClearable={true}
              selectProps={{
                isDisabled: isPending,
                noOptionsMessage: () => "No hay partidas disponibles",
                styles: {
                  control: (base) => ({
                    ...base,
                    minHeight: "30px", // Un poco más pequeño para ser más "vanilla"
                    height: "30px",
                    fontSize: "12px", // sm
                  }),
                  option: (base) => ({
                    ...base,
                    fontSize: "11px", // xs
                    padding: "4px 8px", // Reducimos el padding para que sea compacto
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "12px",
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "30px",
                  }),
                  menu: (base) => ({
                    ...base,
                    fontSize: "11px",
                  }),
                },
              }}
            />

            {selectedPartida && (
              <p className="text-[11px] text-muted-foreground">
                Saldo disponible:{" "}
                <span className="font-medium text-foreground">
                  {formatMonedaGT(selectedPartida.montoDisponible)}
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
