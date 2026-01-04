"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdvancedDialog } from "@/utils/components/AdvancedDialog";
import { CierreCajaDialog } from "./cierre-caja-dialog";
import { CajaAbierta, CerrarCaja, IniciarCaja } from "./interfaces";
import { formattFechaWithMinutes } from "../Utils/Utils";
import { CuentasBancariasSelect } from "@/Types/CuentasBancarias/CuentasBancariasSelect";

interface CajaInicioProps {
  hasOpen: boolean;
  // abrir
  nuevaCaja: IniciarCaja | null;
  handleChangeGeneric: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmitIniciarCaja: () => Promise<void>;
  // cerrar - using existing props from main page
  cerrarCajaDto: CerrarCaja | null;
  handleChangeCerrar: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleCerrarCaja: () => Promise<void>;
  // ui states
  isSubmiting: boolean;
  cajaMontoAnterior: number;
  openCloseCaja: boolean;
  openConfirmDialog: boolean;
  setOpenCloseCaja: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenConfirDialog: React.Dispatch<React.SetStateAction<boolean>>;
  cajaAbierta: CajaAbierta | null;
  reloadContext: () => Promise<void>;
  //
  cuentas: CuentasBancariasSelect[];
}

function CajaForm({
  hasOpen,
  // abrir
  nuevaCaja,
  handleChangeGeneric,
  handleSubmitIniciarCaja,
  // cerrar - existing props
  cerrarCajaDto,
  // handleChangeCerrar, porque?
  handleCerrarCaja,
  // ui states
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

  // const truncateInputSaldo: boolean = cajaMontoAnterior > 0 ? true : false;

  const fechaApertura = cajaAbierta?.fechaApertura
    ? typeof cajaAbierta.fechaApertura === "string"
      ? new Date(cajaAbierta.fechaApertura)
      : cajaAbierta.fechaApertura
    : new Date();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-lg">
          {hasOpen ? "Cerrar turno en caja" : "Registrar turno en caja"}
        </CardTitle>
        <CardDescription className="text-center">
          {hasOpen
            ? `Caja abierta desde ${
                formattFechaWithMinutes(fechaApertura) ?? ""
              }`
            : "Ingrese su saldo inicial o tome el del día anterior"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {hasOpen ? (
          // --- MODO CERRAR ---
          <div className="flex flex-col gap-6">
            <div className="grid gap-1 text-sm">
              <span className="font-medium">Saldo inicial del turno</span>
              <div className="rounded-md border px-3 py-2 bg-muted">
                Q {cajaAbierta?.saldoInicial?.toFixed(2) ?? "0.00"}
              </div>
            </div>

            {/* 👇 Aquí quitas el textarea de comentario final */}
            {/* El comentario final solo se gestiona en el Dialog */}
          </div>
        ) : (
          // --- MODO ABRIR ---
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="saldoInicial">Saldo inicial</Label>
              <Input
                id="saldoInicial"
                name="saldoInicial"
                type="number"
                // Usamos el valor de nuevaCaja (controlado). Si por alguna razón nuevaCaja es null,
                // mostramos cajaMontoAnterior como fallback para que no quede vacío.
                value={
                  nuevaCaja
                    ? // si existe nuevaCaja usar su saldo (editable)
                      nuevaCaja.saldoInicial ?? ""
                    : // fallback visual, no controlamos si no existe nuevaCaja
                      cajaMontoAnterior ?? ""
                }
                onChange={handleChangeGeneric}
                placeholder="Ingrese su saldo inicial para este turno"
                required
              />
              <span
                className="text-xs text-muted-foreground"
                aria-live="polite"
              >
                {cajaMontoAnterior > 0
                  ? "Tomando saldo anterior (puedes editarlo)"
                  : "\u00A0"}
              </span>
            </div>

            {/* 👇 Este sí se queda, porque es el comentario inicial */}
            <div className="grid gap-2">
              <Label htmlFor="comentario">Comentario inicial</Label>
              <Textarea
                value={nuevaCaja?.comentario ?? ""}
                onChange={handleChangeGeneric}
                id="comentario"
                name="comentario"
                placeholder="Comentario opcional"
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        {!hasOpen ? (
          <Button
            type="button"
            className="w-full bg-green-500 hover:bg-green-500"
            onClick={() => setOpenConfirDialog(true)}
            disabled={!nuevaCaja || isSubmiting}
          >
            Registrar turno
          </Button>
        ) : null}

        {hasOpen ? (
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => setOpenCierreCajaDialog(true)}
              type="button"
              variant="destructive"
              className="w-full"
              disabled={isSubmiting}
            >
              Cerrar caja
            </Button>
          </div>
        ) : null}
      </CardFooter>

      {/* Confirm abrir */}
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

      {hasOpen && cajaAbierta && (
        <CierreCajaDialog
          cuentas={cuentas}
          reloadContext={reloadContext}
          open={openCierreCajaDialog}
          onOpenChange={setOpenCierreCajaDialog}
          registroCajaId={cajaAbierta.id}
          usuarioCierreId={cerrarCajaDto?.usuarioCierra ?? 0}
          cuentasBancarias={cuentas}
          onClosed={() => {
            // Callback when V2 close is completed - you can add reload logic here
            console.log("Caja cerrada con V2");
          }}
        />
      )}
    </Card>
  );
}

export default CajaForm;
