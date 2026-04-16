"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Props {
  isTotal: boolean;
  onToggle: (val: boolean) => void;
  loadingPreview: boolean;
  efectivoDisponible: number | null;
  watchedMonto: number;
}

export function DepositoCierreControls({
  isTotal,
  onToggle,
  loadingPreview,
  efectivoDisponible,
  watchedMonto,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Switch
          id="deposito-total"
          checked={isTotal}
          onCheckedChange={onToggle}
          className="scale-90"
        />
        <Label htmlFor="deposito-total" className="text-xs cursor-pointer">
          Depósito total (automático)
        </Label>
      </div>

      {!isTotal && (
        <div className="text-xs text-muted-foreground space-y-0.5 pl-1">
          {loadingPreview ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Calculando...
            </span>
          ) : efectivoDisponible !== null ? (
            <>
              <p>
                Disponible:{" "}
                <span className="font-medium text-foreground">
                  Q {efectivoDisponible.toFixed(2)}
                </span>
              </p>
              <p>
                Saldo tras depósito:{" "}
                <span className="font-medium text-foreground">
                  Q {(efectivoDisponible - watchedMonto).toFixed(2)}
                </span>
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
