import React from "react";
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
import { CajaAbierta, CerrarCaja, IniciarCaja } from "./types/interfaces";
import { Textarea } from "@/components/ui/textarea";
import { AdvancedDialog } from "@/utils/components/AdvancedDialog";
import { formattFechaWithMinutes } from "../Utils/Utils";

interface CajaInicioProps {
  hasOpen: boolean;
  // abrir
  nuevaCaja: IniciarCaja | null;
  handleChangeGeneric: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmitIniciarCaja: () => Promise<void>;
  // cerrar
  cerrarCajaDto: CerrarCaja | null;
  handleChangeCerrar: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleCerrarCaja: () => Promise<void>;
  // comunes
  isSubmiting: boolean;
  cajaMontoAnterior: number;
  openConfirmDialog: boolean;
  setOpenConfirDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openCloseCaja: boolean;
  setOpenCloseCaja: React.Dispatch<React.SetStateAction<boolean>>;
  cajaAbierta: CajaAbierta | null;
}

function CajaForm({
  hasOpen,
  // abrir
  nuevaCaja,
  handleChangeGeneric,
  handleSubmitIniciarCaja,
  // cerrar
  cerrarCajaDto,
  handleChangeCerrar,
  handleCerrarCaja,
  // comunes
  isSubmiting,
  cajaMontoAnterior,
  openCloseCaja,
  openConfirmDialog,
  setOpenCloseCaja,
  setOpenConfirDialog,
  cajaAbierta,
}: CajaInicioProps) {
  const truncateInputSaldo: boolean = cajaMontoAnterior > 0 ? true : false;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-center text-lg">
          {hasOpen ? "Cerrar turno en caja" : "Registrar turno en caja"}
        </CardTitle>
        <CardDescription className="text-center">
          {hasOpen
            ? `Caja abierta desde ${
                formattFechaWithMinutes(
                  cajaAbierta?.fechaApertura ?? new Date(),
                ) ?? ""
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

            <div className="grid gap-2">
              <Label htmlFor="comentarioFinal">
                Comentario final (opcional)
              </Label>
              <Textarea
                id="comentarioFinal"
                name="comentarioFinal"
                value={cerrarCajaDto?.comentarioFinal ?? ""}
                onChange={handleChangeCerrar}
                placeholder="Notas del cierre"
              />
            </div>
          </div>
        ) : (
          // --- MODO ABRIR ---
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="saldoInicial">Saldo inicial</Label>
              <Input
                value={nuevaCaja?.saldoInicial ?? ""}
                onChange={handleChangeGeneric}
                id="saldoInicial"
                name="saldoInicial"
                type="number"
                placeholder="Ingrese su saldo inicial para este turno"
                required
                disabled={truncateInputSaldo}
              />
              <span
                className="text-xs text-muted-foreground"
                aria-live="polite"
              >
                {truncateInputSaldo ? "Tomando saldo anterior" : "\u00A0"}
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comentario">Comentario</Label>
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
          <Button
            onClick={() => setOpenCloseCaja(true)}
            type="button"
            variant="destructive"
            className="w-full"
            disabled={!cerrarCajaDto || isSubmiting}
          >
            Cerrar caja
          </Button>
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

      {/* Confirm cerrar */}
      <AdvancedDialog
        type="warning"
        title="¿Cerrar el turno con estos datos?"
        description="Se cerrará tu registro de caja en este turno."
        open={openCloseCaja}
        onOpenChange={setOpenCloseCaja}
        confirmButton={{
          label: "Sí, cerrar",
          disabled: isSubmiting || !cerrarCajaDto,
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
    </Card>
  );
}

export default CajaForm;
