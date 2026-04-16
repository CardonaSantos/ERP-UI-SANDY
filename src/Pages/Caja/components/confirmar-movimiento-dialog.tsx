"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ConfirmarMovimientoDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Confirmar registro
          </DialogTitle>
          <DialogDescription className="text-xs">
            ¿Confirmas el registro de este movimiento financiero? Esta acción no
            se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button size="sm" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Registrando…" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
