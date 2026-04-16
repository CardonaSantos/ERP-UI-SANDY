"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdvancedDialog } from "@/utils/components/AdvancedDialog";
import { CierreCajaDialog } from "./cierre-caja-dialog";
import type { CajaAbierta, CerrarCaja, IniciarCaja } from "./types/interfaces";
import { formattFechaWithMinutes } from "../Utils/Utils";
import type { CuentasBancariasSelect } from "@/Types/CuentasBancarias/CuentasBancariasSelect";
import {
  LockOpen,
  Lock,
  Clock,
  Wallet,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

interface CajaInicioProps {
  hasOpen: boolean;
  nuevaCaja: IniciarCaja | null;
  handleChangeGeneric: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmitIniciarCaja: () => Promise<void>;
  cerrarCajaDto: CerrarCaja | null;
  handleChangeCerrar: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleCerrarCaja: () => Promise<void>;
  isSubmiting: boolean;
  cajaMontoAnterior: number;
  openCloseCaja: boolean;
  openConfirmDialog: boolean;
  setOpenCloseCaja: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenConfirDialog: React.Dispatch<React.SetStateAction<boolean>>;
  cajaAbierta: CajaAbierta | null;
  reloadContext: () => Promise<void>;
  cuentas: CuentasBancariasSelect[];
}

// --- Subcomponente: modo apertura ---
function AperturaCaja({
  nuevaCaja,
  cajaMontoAnterior,
  handleChangeGeneric,
}: Pick<
  CajaInicioProps,
  "nuevaCaja" | "cajaMontoAnterior" | "handleChangeGeneric"
>) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-1">
        <Label
          htmlFor="saldoInicial"
          className="text-xs font-medium flex items-center gap-1"
        >
          <Wallet size={13} className="text-muted-foreground" aria-hidden />
          Saldo inicial
        </Label>
        <Input
          id="saldoInicial"
          name="saldoInicial"
          type="number"
          value={
            nuevaCaja
              ? (nuevaCaja.saldoInicial ?? "")
              : (cajaMontoAnterior ?? "")
          }
          onChange={handleChangeGeneric}
          placeholder="0.00"
          required
          className="h-8 text-sm"
        />
        {cajaMontoAnterior > 0 && (
          <span className="text-xs text-muted-foreground" aria-live="polite">
            Tomando saldo anterior — puedes editarlo
          </span>
        )}
      </div>

      <div className="grid gap-1">
        <Label
          htmlFor="comentario"
          className="text-xs font-medium flex items-center gap-1"
        >
          <MessageSquare
            size={13}
            className="text-muted-foreground"
            aria-hidden
          />
          Comentario
        </Label>
        <Textarea
          id="comentario"
          name="comentario"
          value={nuevaCaja?.comentario ?? ""}
          onChange={handleChangeGeneric}
          placeholder="Comentario opcional"
          rows={2}
          className="text-sm resize-none"
        />
      </div>
    </div>
  );
}

// --- Subcomponente: modo cierre ---
function CierreCaja({ cajaAbierta }: Pick<CajaInicioProps, "cajaAbierta">) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Wallet size={13} aria-hidden />
        Saldo inicial del turno
      </span>
      <div
        className="rounded border bg-muted px-3 py-2 text-sm font-mono tabular-nums"
        aria-label="Saldo inicial del turno"
      >
        Q {cajaAbierta?.saldoInicial?.toFixed(2) ?? "0.00"}
      </div>
    </div>
  );
}

// --- Componente principal ---
function CajaForm({
  hasOpen,
  nuevaCaja,
  handleChangeGeneric,
  handleSubmitIniciarCaja,
  cerrarCajaDto,
  handleCerrarCaja,
  isSubmiting,
  cajaMontoAnterior,
  openCloseCaja,
  openConfirmDialog,
  setOpenCloseCaja,
  setOpenConfirDialog,
  cajaAbierta,
  reloadContext,
  cuentas,
}: CajaInicioProps) {
  const [openCierreCajaDialog, setOpenCierreCajaDialog] = useState(false);

  const fechaApertura = cajaAbierta?.fechaApertura
    ? typeof cajaAbierta.fechaApertura === "string"
      ? new Date(cajaAbierta.fechaApertura)
      : cajaAbierta.fechaApertura
    : new Date();

  return (
    <Card className="w-full">
      {/* Header */}
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          {hasOpen ? (
            <Lock size={15} className="text-destructive shrink-0" aria-hidden />
          ) : (
            <LockOpen
              size={15}
              className="text-green-600 shrink-0"
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none truncate">
              {hasOpen ? "Cerrar turno en caja" : "Registrar turno en caja"}
            </p>
            {hasOpen ? (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock size={11} aria-hidden />
                Abierta desde {formattFechaWithMinutes(fechaApertura) ?? "—"}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                Ingresa el saldo inicial del turno
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-4 py-3">
        {hasOpen ? (
          <CierreCaja cajaAbierta={cajaAbierta} />
        ) : (
          <AperturaCaja
            nuevaCaja={nuevaCaja}
            cajaMontoAnterior={cajaMontoAnterior}
            handleChangeGeneric={handleChangeGeneric}
          />
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-4 py-3 border-t">
        {!hasOpen ? (
          <Button
            type="button"
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
            onClick={() => setOpenConfirDialog(true)}
            disabled={!nuevaCaja || isSubmiting}
            aria-label="Registrar turno en caja"
          >
            <CheckCircle size={13} className="mr-1.5" aria-hidden />
            Registrar turno
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => setOpenCierreCajaDialog(true)}
            disabled={isSubmiting}
            aria-label="Cerrar turno en caja"
          >
            <Lock size={13} className="mr-1.5" aria-hidden />
            Cerrar caja
          </Button>
        )}
      </CardFooter>

      {/* Dialog: confirmar apertura */}
      <AdvancedDialog
        type="confirmation"
        title="¿Iniciar turno con estos datos?"
        description="Se comenzará un registro de turno en caja para este usuario."
        open={openConfirmDialog}
        onOpenChange={setOpenConfirDialog}
        confirmButton={{
          label: "Sí, continuar",
          disabled: isSubmiting,
          loading: isSubmiting,
          loadingText: "Registrando...",
          onClick: handleSubmitIniciarCaja,
        }}
        cancelButton={{
          label: "Cancelar",
          disabled: isSubmiting,
          onClick: () => setOpenConfirDialog(false),
        }}
      />

      {/* Dialog: confirmar cierre (legacy) */}
      <AdvancedDialog
        type="warning"
        title="¿Cerrar turno en caja?"
        description="Se cerrará el turno actual y no podrá realizar más operaciones."
        open={openCloseCaja}
        onOpenChange={setOpenCloseCaja}
        confirmButton={{
          label: "Sí, cerrar",
          disabled: isSubmiting,
          loading: isSubmiting,
          loadingText: "Cerrando...",
          onClick: handleCerrarCaja,
        }}
        cancelButton={{
          label: "Cancelar",
          disabled: isSubmiting,
          onClick: () => setOpenCloseCaja(false),
        }}
      />

      {/* Dialog: cierre detallado */}
      {hasOpen && cajaAbierta && (
        <CierreCajaDialog
          cuentas={cuentas}
          reloadContext={reloadContext}
          open={openCierreCajaDialog}
          onOpenChange={setOpenCierreCajaDialog}
          registroCajaId={cajaAbierta.id}
          usuarioCierreId={cerrarCajaDto?.usuarioCierra ?? 0}
          cuentasBancarias={cuentas}
          onClosed={() => {}}
        />
      )}
    </Card>
  );
}

export default CajaForm;
