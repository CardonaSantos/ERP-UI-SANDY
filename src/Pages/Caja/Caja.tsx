import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CerrarCaja, IniciarCaja } from "./types/interfaces";

import { useStore } from "@/components/Context/ContextSucursal";
import { PageTransition } from "@/components/Transition/layout-transition";
import {
  useCloseCaja,
  useGetUltimaCajaAbierta,
  useGetUltimoSaldoSucursal,
  useIniciarCaja,
} from "@/hooks/use-cajas/use-cajas";
import { useGetCuentasBancarias } from "@/hooks/use-cuentas-bancarias/use-cuentas-bancarias";

import CajaForm from "./caja-form";
import MovimientoCajaPage from "./Movimientos/movimiento-caja-page";
import { useGetProveedores } from "@/hooks/getProveedoresSelect/proveedores";
import { useQueryClient } from "@tanstack/react-query";
import { cajasQkeys } from "@/hooks/use-cajas/Qk";
import { ReusableTabs, TabItem } from "@/utils/components/tabs/reusable-tabs";
import { useSearchParams } from "react-router-dom";
import { useTabChangeWithUrl } from "@/utils/components/tabs/handleTabChangeWithParamURL";
import { Clipboard, ReceiptText } from "lucide-react";

type DialogState = {
  confirmDialog: boolean;
  closeCaja: boolean;
};

// COMPONENT
function Caja() {
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get("tab") as string) || "caja";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const sucursalID = useStore((state) => state.sucursalId) ?? 0;
  const userID = useStore((state) => state.userId) ?? 0;
  const cajaAbiertaResponse = useGetUltimaCajaAbierta(sucursalID, userID);
  const cajaAbierta = cajaAbiertaResponse.data ?? null;
  const cajaMontoAnteriorResponse = useGetUltimoSaldoSucursal(
    sucursalID,
    userID,
  );
  const cajaMontoAnterior = cajaMontoAnteriorResponse.data ?? 0;
  const cuentasBancariasResponse = useGetCuentasBancarias();

  const iniciarCaja = useIniciarCaja();

  const cerrarCaja = useCloseCaja();

  const cuentas = cuentasBancariasResponse.data ?? [];
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [dialogs, setDialogs] = useState<DialogState>({
    confirmDialog: false,
    closeCaja: false,
  });

  const [nuevaCaja, setNuevaCaja] = useState<IniciarCaja | null>({
    saldoInicial: cajaMontoAnterior ?? 0,
    sucursalId: sucursalID,
    usuarioInicioId: userID,
    comentario: "",
  });

  const [cerrarCajaDto, setCerrarCajaDto] = useState<CerrarCaja | null>({
    registroCajaId: cajaAbierta?.id ?? 0,
    usuarioCierra: userID,
    comentarioFinal: "",
  });

  const { data: proveedoresResponse } = useGetProveedores();
  const proveedores = proveedoresResponse ? proveedoresResponse : [];
  const hasOpen = !!cajaAbierta && cajaAbierta.estado === "ABIERTO";

  /**
   * Sincroniza el estado de formularios cuando cambia si hay caja abierta
   */
  useEffect(() => {
    if (hasOpen) {
      setNuevaCaja(null);
      setCerrarCajaDto((prev) => ({
        ...(prev ?? ({} as CerrarCaja)),
        registroCajaId: cajaAbierta?.id ?? 0,
        usuarioCierra: userID,
        comentarioFinal: "",
      }));
    } else {
      setCerrarCajaDto(null);
      setNuevaCaja({
        saldoInicial: cajaMontoAnterior ?? 0,
        sucursalId: sucursalID,
        usuarioInicioId: userID,
        comentario: "",
      });
    }
  }, [hasOpen, cajaMontoAnterior, sucursalID, userID, cajaAbierta?.id]);

  useEffect(() => {
    reloadContext();
  }, []);

  const handleChangeGeneric = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!nuevaCaja) return;

    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") return;

    setNuevaCaja({
      ...nuevaCaja,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    });
  };

  const handleChangeCerrar = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!cerrarCajaDto) return;

    const { name, value, type } = e.target as HTMLInputElement;
    setCerrarCajaDto({
      ...cerrarCajaDto,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    });
  };

  const handleToggleDialog = (dialog: keyof DialogState, value: boolean) => {
    setDialogs((prev) => ({
      ...prev,
      [dialog]: value,
    }));
  };

  /**
   * Inicia una nueva caja
   */
  const handleSubmitIniciarCaja = async () => {
    if (!nuevaCaja || isSubmiting) return;
    setIsSubmiting(true);

    if (nuevaCaja.saldoInicial <= 0) {
      toast.warning("No se puede iniciar turno con saldo cero");
      setIsSubmiting(false);
      handleToggleDialog("confirmDialog", false);
      await reloadContext();
      return;
    }

    try {
      await toast.promise(iniciarCaja.mutateAsync(nuevaCaja), {
        loading: "Iniciando turno...",
        success: "Turno registrado",
        error: "Error al registrar turno",
      });
    } finally {
      setIsSubmiting(false);
      handleToggleDialog("confirmDialog", false);
      await reloadContext();
    }
  };

  /**
   * Cierra la caja actual
   */
  const handleCerrarCaja = async () => {
    if (!cerrarCajaDto || isSubmiting) return;
    setIsSubmiting(true);

    try {
      await toast.promise(cerrarCaja.mutateAsync(cerrarCajaDto), {
        loading: "Cerrando turno...",
        success: "Caja cerrada correctamente",
        error: "Error al cerrar turno",
      });
    } finally {
      setIsSubmiting(false);
      handleToggleDialog("closeCaja", false);
      await reloadContext();
    }
  };

  const reloadContext = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: cajasQkeys.all,
    });
  }, [queryClient]);

  const handleChangeTabs = useTabChangeWithUrl({
    activeTab,
    setActiveTab,
    searchParams,
    setSearchParams,
  });

  const dataTabs: Array<TabItem> = [
    {
      content: (
        <CajaForm
          cuentas={cuentas}
          hasOpen={hasOpen}
          nuevaCaja={nuevaCaja}
          handleChangeGeneric={handleChangeGeneric}
          handleSubmitIniciarCaja={handleSubmitIniciarCaja}
          cerrarCajaDto={cerrarCajaDto}
          handleChangeCerrar={handleChangeCerrar}
          handleCerrarCaja={handleCerrarCaja}
          isSubmiting={isSubmiting}
          cajaMontoAnterior={cajaMontoAnterior}
          openCloseCaja={dialogs.closeCaja}
          openConfirmDialog={dialogs.confirmDialog}
          setOpenCloseCaja={(v) =>
            handleToggleDialog("closeCaja", v as boolean)
          }
          setOpenConfirDialog={(v) =>
            handleToggleDialog("confirmDialog", v as boolean)
          }
          cajaAbierta={cajaAbierta}
          reloadContext={reloadContext}
        />
      ),
      label: "Turno en Caja",
      value: "caja",
      icon: <Clipboard size={15} />,
    },

    {
      content: (
        <MovimientoCajaPage
          proveedores={proveedores}
          reloadContext={reloadContext}
          userID={userID}
          cuentasBancarias={cuentas}
        />
      ),
      label: "Movimientos Financieros.",
      value: "generar-mf",
      icon: <ReceiptText size={15} />,
    },
  ];

  return (
    <PageTransition
      fallbackBackTo="/"
      titleHeader="Registro de Caja y Movimientos Financieros"
    >
      <ReusableTabs
        tabs={dataTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className=""
        defaultValue={defaultTab}
        handleTabChange={handleChangeTabs}
        variant="compact"
      />
    </PageTransition>
  );
}

export default Caja;
