"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CreditCard,
  Layers,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdvancedDialog } from "@/utils/components/AdvancedDialog";
import { useStore } from "@/components/Context/ContextSucursal";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { TZGT } from "../Utils/Utils";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ItemDetallesPayloadParcial,
  PayloadRecepcionParcial,
} from "./table-select-recepcion/selectedItems";
import dayjs from "dayjs";
import RecepcionesMain from "./Recepciones/RecepcionesMain";
import CreditoCompraMainPage from "./Credito/CreditoCompraMainPage";
import { normalizarDetalles } from "./Credito/helpers/normalizador";
import CostosAsociadosDialog from "./components/Costos Asociados Dialog";
import {
  CostosAsociadosDialogResult,
  MovimientoFinancieroDraft,
  ProrrateoMeta,
} from "./costo-asociado-types";
import ComprasMain from "./comprasMain";
import PaymentMethodCompraDialogConfirm from "./payment-compra-dialog";
import {
  useGetCompraDetails,
  useRecepcionarCompraParcial,
  useRecepcionarCompraTotal,
} from "@/hooks/use-compras/use-compras";
import {
  useGetCompraRecepcionable,
  useGetCreditoCompra,
} from "@/hooks/use-creditos/use-creditos";
import { useGetCajasDisponibles } from "@/hooks/use-cajas/use-cajas";
import { useGetCuentasBancarias } from "@/hooks/use-cuentas-bancarias/use-cuentas-bancarias";
import { useProveedoresSelect } from "@/hooks/getProveedoresSelect/proveedores";
import { useTabChangeWithUrl } from "@/utils/components/tabs/handleTabChangeWithParamURL";
import { ReusableTabs, TabItem } from "@/utils/components/tabs/reusable-tabs";
import { PageTransition } from "@/components/Transition/layout-transition";

interface Option {
  label: string;
  value: string;
}

type MetodoPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "CHEQUE"
  | "CREDITO"
  | "OTRO"
  | "CONTADO";

type RecepcionFlow = "NORMAL" | "PARCIAL";

export default function CompraDetalle() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const userId = useStore((state) => state.userId) ?? 0;
  const sucursalId = useStore((state) => state.sucursalId) ?? 0;
  const compraId = Number.isFinite(Number(id)) ? Number(id) : 0;

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get("tab") as string) || "compra";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const {
    data: registroQ,
    isPending: isPendingRegistro,
    isError: isErrorRegistro,
    error: errorRegistro,
    refetch: reFetchRegistro,
  } = useGetCompraDetails(compraId);

  const { data: creditoFromCompra, refetch: refetchCredito } =
    useGetCreditoCompra(compraId);

  const {
    data: recepcionable = {
      id: compraId,
      estado: "ESPERANDO_ENTREGA",
      estadoCalculado: "ESPERANDO_ENTREGA",
      detalles: [],
    },
    isPending: isPendingDrp,
    refetch: reFetchDRP,
  } = useGetCompraRecepcionable(compraId);

  const cajasQ = useGetCajasDisponibles(sucursalId);
  const cuentasQ = useGetCuentasBancarias();
  const proveedoresQ = useProveedoresSelect();

  const recepcionarM = useRecepcionarCompraTotal(compraId);
  const handleRecepcionarParcial = useRecepcionarCompraParcial(compraId);

  const [recepcionFlow, setRecepcionFlow] = useState<RecepcionFlow>("NORMAL");
  const [isRecibirParcial, setIsRecibirParcial] = useState<boolean>(false);

  // Dialogs UI
  const [openSendStock, setOpenSendStock] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openFormPaymentDialog, setOpenFormPaymentDialog] = useState(false);
  const [openCostoDialog, setOpenCostoDialog] = useState(false);
  const [openRecibirParcial, setOpenRecibirParcial] = useState<boolean>(false);
  const [costoStepDone, setCostoStepDone] = useState(false);

  // Datos de Formulario
  const [observaciones, setObservaciones] = useState<string>("");
  const [proveedorSelected, setProveedorSelected] = useState<
    string | undefined
  >(undefined);
  const [metodoPago, setMetodoPago] = useState<MetodoPago | "">("");
  const [cuentaBancariaSelected, setCuentaBancariaSelected] =
    useState<string>("");
  const [cajaSelected, setCajaSelected] = useState<string | null>(null);

  // Payloads Complejos
  const [mfDraft, setMfDraft] = useState<MovimientoFinancieroDraft | null>(
    null,
  );
  const [prorrateoMeta, setProrrateoMeta] = useState<ProrrateoMeta | null>(
    null,
  );
  const [selectedItems, setSelectedItems] = useState<PayloadRecepcionParcial>({
    compraId: compraId,
    fecha: dayjs().tz(TZGT).startOf("day").toISOString(),
    observaciones: "",
    usuarioId: userId,
    sucursalId: sucursalId,
    lineas: [],
  });

  const handleChangeTabs = useTabChangeWithUrl({
    activeTab,
    setActiveTab,
    searchParams,
    setSearchParams,
  });

  // HELPERS Y DATOS DERIVADOS =========================================
  const isBankMethod = (m?: MetodoPago | "") =>
    m === "TRANSFERENCIA" || m === "TARJETA" || m === "CHEQUE";

  const isCashMethod = (m?: MetodoPago | "") =>
    m === "EFECTIVO" || m === "CONTADO";

  const registro = registroQ ?? null;
  const proveedores = proveedoresQ.data ?? [];
  const cuentasBancarias = cuentasQ.data ?? [];
  const cajasDisponibles = cajasQ.data ?? [];

  const loadingHard = isPendingRegistro;
  const errorHard = isErrorRegistro && !registro;
  const hasCredit: boolean =
    Boolean(creditoFromCompra?.id) &&
    (creditoFromCompra?.cuotas?.length ?? 0) > 0;

  const normalizados = normalizarDetalles(
    Array.isArray(registro?.detalles) ? registro.detalles : [],
  );

  const montoRecepcion = useMemo(() => {
    if (recepcionFlow === "PARCIAL") {
      return selectedItems.lineas.reduce(
        (acc: number, item: ItemDetallesPayloadParcial) =>
          acc + item.cantidadRecibida * item.precioCosto,
        0,
      );
    }
    return Number(registro?.resumen?.subtotal ?? registro?.total ?? 0);
  }, [registro, recepcionFlow, selectedItems]);

  const selectedIds = useMemo(() => {
    return new Set(selectedItems.lineas.map((l) => l.compraDetalleId));
  }, [selectedItems]);

  const optionsCajas: Option[] = cajasDisponibles.map((c) => ({
    label: `${c.usuarioInicio.nombre} — Caja #${c.id} | Saldo: ${formattMonedaGT(c.disponibleEnCaja)}`,
    value: c.id.toString(),
  }));

  const cajaSel = cajasDisponibles.find(
    (c) => String(c.id) === String(cajaSelected),
  );

  const cajaTieneSaldo = isCashMethod(metodoPago)
    ? !!cajaSel && Number(cajaSel.disponibleEnCaja) >= montoRecepcion
    : true;

  const requiereBanco = isBankMethod(metodoPago);
  const requiereCaja = isCashMethod(metodoPago);

  const canContinue =
    !!observaciones.trim() &&
    !!proveedorSelected &&
    !!metodoPago &&
    (!requiereBanco || !!cuentaBancariaSelected) &&
    (!requiereCaja || (!!cajaSelected && cajaTieneSaldo));

  // CALLBACKS Y ACTUALIZADORES DE ESTADO ==============================
  const buildMf = useCallback(() => {
    if (!mfDraft) return undefined;
    return {
      ...mfDraft,
      sucursalId: mfDraft.sucursalId ?? sucursalId,
      proveedorId: mfDraft.proveedorId ?? Number(proveedorSelected),
    };
  }, [mfDraft, sucursalId, proveedorSelected]);

  const buildProrrateo = useCallback(() => {
    if (!prorrateoMeta?.aplicar) return undefined;
    return {
      aplicar: true,
      base: prorrateoMeta.base ?? "COSTO",
      incluirAntiguos: prorrateoMeta.incluirAntiguos ?? false,
    } as const;
  }, [prorrateoMeta]);

  const updateCantidadDetalle = (
    compraDetalleId: number,
    nuevaCantidad: number,
  ) => {
    setSelectedItems((prev) => ({
      ...prev,
      lineas: prev.lineas.map((l) =>
        l.compraDetalleId === compraDetalleId
          ? { ...l, cantidadRecibida: nuevaCantidad }
          : l,
      ),
    }));
  };

  const updateFechaVencimiento = (
    compraDetalleId: number,
    nuevaFechaVencimiento: string,
  ) => {
    setSelectedItems((previa) => ({
      ...previa,
      lineas: previa.lineas.map((linea) =>
        linea.compraDetalleId === compraDetalleId
          ? { ...linea, fechaExpiracion: nuevaFechaVencimiento }
          : linea,
      ),
    }));
  };

  const upsserSelectItems = (
    item: ItemDetallesPayloadParcial,
    checked: boolean,
  ) => {
    setSelectedItems((prev) => {
      const exists = prev.lineas.some(
        (l) => l.compraDetalleId === item.compraDetalleId,
      );

      if (checked) {
        return exists
          ? {
              ...prev,
              lineas: prev.lineas.map((l) =>
                l.compraDetalleId === item.compraDetalleId
                  ? {
                      ...l,
                      ...item,
                      fechaExpiracion:
                        item.fechaExpiracion ?? l.fechaExpiracion,
                      checked: true,
                    }
                  : l,
              ),
            }
          : {
              ...prev,
              lineas: [...prev.lineas, { ...item, checked: true }],
            };
      } else {
        return {
          ...prev,
          lineas: prev.lineas.filter(
            (l) => l.compraDetalleId !== item.compraDetalleId,
          ),
        };
      }
    });
  };

  const verifyTransaction = () => {
    if (
      !selectedItems.compraId ||
      !selectedItems.sucursalId ||
      !selectedItems.usuarioId ||
      !selectedItems.lineas ||
      selectedItems.lineas.length <= 0
    ) {
      return false;
    }
    return true;
  };

  //  HANDLERS DE ACCIÓN ================================================
  const onBack = () => navigate(-1);

  const handleSelectCaja = (option: Option | null) => {
    setCajaSelected(option ? option.value : null);
  };

  const onContinueFromPayment = useCallback(() => {
    setOpenFormPaymentDialog(false);
    setCostoStepDone(false);
    setOpenCostoDialog(true);
  }, [setOpenFormPaymentDialog]);

  const handleRefresAll = React.useCallback(async () => {
    await Promise.allSettled([
      reFetchDRP(),
      reFetchRegistro(),
      refetchCredito(),
    ]);
  }, [reFetchDRP, reFetchRegistro, refetchCredito]);

  const handleCreateRecepcionParcial = async () => {
    try {
      const isValid = verifyTransaction();
      if (!isValid) {
        toast.warning("Verifique los datos a enviar");
        return;
      }

      const mf = buildMf();
      const pr = buildProrrateo();
      const debeProrratear = Boolean(pr) && mf?.motivo === "COSTO_ASOCIADO";

      const payloadParcial = {
        ...selectedItems,
        ...(mf ? { mf } : {}),
        ...(debeProrratear
          ? {
              prorrateo: pr,
              aplicarProrrateo: true,
            }
          : {}),
      };

      await toast.promise(
        handleRecepcionarParcial.mutateAsync(payloadParcial),
        {
          success: "Compra parcial recepcionada",
          error: (error) => getApiErrorMessageAxios(error),
          loading: "Registrando entrada...",
        },
      );
    } catch (error) {
      console.log("El error: ", error);
    }
  };

  const sendtToStock = useCallback(async () => {
    if (!registro || recepcionarM.isPending) return;

    const usuarioId = registro.usuario.id ?? 1;

    if (!proveedorSelected) {
      toast.error("Seleccione un proveedor");
      return;
    }
    if (!metodoPago) {
      toast.error("Seleccione un método de pago");
      return;
    }
    if (isBankMethod(metodoPago) && !cuentaBancariaSelected) {
      toast.error("Seleccione una cuenta bancaria para este método");
      return;
    }
    if (isCashMethod(metodoPago)) {
      if (!cajaSelected) {
        toast.error("Seleccione una caja con saldo suficiente.");
        return;
      }
      if (!cajaSel || Number(cajaSel.disponibleEnCaja) < montoRecepcion) {
        toast.error("La caja seleccionada no tiene saldo suficiente.");
        return;
      }
    }

    const mf = buildMf();
    const aplicarProrrateo =
      Boolean(prorrateoMeta?.aplicar) && mf?.motivo === "COSTO_ASOCIADO";

    const payload: {
      compraId?: number;
      usuarioId: number;
      proveedorId: number;
      observaciones?: string;
      metodoPago: string;
      registroCajaId?: number;
      sucursalId: number;
      cuentaBancariaId?: number;
      lineas?: Array<{
        fechaVencimiento: string;
        compraDetalleId: number;
        loteCodigo: string;
      }>;
      mf?: typeof mf;
      prorrateo?: { aplicar: true };
    } = {
      usuarioId,
      proveedorId: Number(proveedorSelected),
      observaciones,
      metodoPago,
      sucursalId,
      ...(isBankMethod(metodoPago) && {
        cuentaBancariaId: Number(cuentaBancariaSelected),
      }),
      ...(isCashMethod(metodoPago) &&
        cajaSelected && { registroCajaId: Number(cajaSelected) }),
      ...(mf ? { mf } : {}),
      ...(aplicarProrrateo ? { prorrateo: { aplicar: true } } : {}),
    };

    await toast.promise(recepcionarM.mutateAsync(payload), {
      loading: "Recepcionando compra...",
      success: "Compra recepcionada y enviada a stock",
      error: (error) => getApiErrorMessageAxios(error),
    });

    setOpenSendStock(false);
    setOpenFormDialog(false);
    setObservaciones("");
  }, [
    registro,
    recepcionarM,
    proveedorSelected,
    observaciones,
    metodoPago,
    cuentaBancariaSelected,
    cajaSelected,
    cajaSel,
    montoRecepcion,
    sucursalId,
    buildMf,
    prorrateoMeta?.aplicar,
  ]);

  useEffect(() => {
    if (!isBankMethod(metodoPago) && cuentaBancariaSelected) {
      setCuentaBancariaSelected("");
    }
  }, [metodoPago, cuentaBancariaSelected]);

  useEffect(() => {
    if (!isCashMethod(metodoPago)) {
      setCajaSelected(null);
      return;
    }
    const candidatas = cajasDisponibles
      .filter((c) => Number(c.disponibleEnCaja) >= montoRecepcion)
      .sort((a, b) => Number(b.disponibleEnCaja) - Number(a.disponibleEnCaja));

    if (!candidatas.length) {
      setCajaSelected(null);
      return;
    }

    const yaSeleccionadaEsValida =
      cajaSelected &&
      candidatas.some((c) => String(c.id) === String(cajaSelected));

    if (!yaSeleccionadaEsValida) {
      setCajaSelected(String(candidatas[0].id));
    }
  }, [metodoPago, cajasDisponibles, montoRecepcion, cajaSelected]);

  useEffect(() => {
    const idProv = registro?.proveedor?.id;
    setProveedorSelected(idProv ? String(idProv) : undefined);
  }, [registro?.proveedor?.id]);

  if (loadingHard) {
    return (
      <div className="min-h-screen bg-background p-2 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Cargando registro de compra...
          </p>
        </div>
      </div>
    );
  }

  if (errorHard) {
    return (
      <div className="min-h-screen bg-background p-2 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="text-sm text-muted-foreground">
            {(errorRegistro as Error)?.message || "Registro no encontrado"}
          </p>
          <Button
            variant="outline"
            onClick={onBack}
            className="mt-4 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando o sin datos...</p>
      </div>
    );
  }

  const tabs: Array<TabItem> = [
    {
      label: "Compra",
      value: "compra",
      icon: <ShoppingBag size={18} />,
      content: (
        <ComprasMain
          openFormPaymentDialog={openFormPaymentDialog}
          setOpenFormPaymentDialog={setOpenFormPaymentDialog}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          isPendingDrp={isPendingDrp}
          reFetchDRP={reFetchDRP}
          isRecibirParcial={isRecibirParcial}
          setIsRecibirParcial={setIsRecibirParcial}
          openFormDialog={openFormDialog}
          setOpenFormDialog={setOpenFormDialog}
          selectedIds={selectedIds}
          openRecibirParcial={openRecibirParcial}
          setOpenRecibirParcial={setOpenRecibirParcial}
          registro={registroQ}
          updateCantidadDetalle={updateCantidadDetalle}
          upsserSelectItems={upsserSelectItems}
          recepcionable={recepcionable}
          onOpenPaymentFor={(flow) => {
            setRecepcionFlow(flow);
            setOpenFormPaymentDialog(true);
          }}
          updateFechaVencimiento={updateFechaVencimiento}
          hasCredit={hasCredit}
        />
      ),
    },

    {
      label: "Recepciones",
      value: "recepciones",
      icon: <Layers size={18} />,
      content: <RecepcionesMain compraId={compraId} />,
    },

    {
      label: "Credito",
      value: "credito",
      icon: <CreditCard size={18} />,
      content: (
        <CreditoCompraMainPage
          cuentasBancarias={cuentasBancarias}
          compraTotal={registro.total}
          proveedores={proveedores}
          compraId={compraId}
          proveedorId={registro.proveedor?.id ?? 0}
          cajasDisponibles={cajasDisponibles}
          montoRecepcion={registro.total}
          handleRefresAll={handleRefresAll}
          creditoFromCompra={creditoFromCompra}
          normalizados={normalizados}
        />
      ),
    },
  ];

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Administrar Compra">
      <ReusableTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleTabChange={handleChangeTabs}
        tabs={tabs}
      />

      <AdvancedDialog
        type="warning"
        onOpenChange={setOpenSendStock}
        open={openSendStock}
        title="Confirmar recepción de compra"
        description="Los productos serán ingresados al stock de la sucursal correspondiente."
        question="¿Deseas continuar con la recepción? Esta acción registrará la entrada al inventario y no se puede revertir.

Si la compra está vinculada a un presupuesto, el monto previamente comprometido será ejecutado y descontado del saldo disponible."
        confirmButton={{
          label: "Confirmar y enviar a stock",
          disabled: recepcionarM.isPending,
          loading: recepcionarM.isPending,
          loadingText: "Procesando recepción...",
          onClick: sendtToStock,
        }}
        cancelButton={{
          label: "Cancelar",
          disabled: recepcionarM.isPending,
          loadingText: "Cancelando...",
          onClick: () => setOpenSendStock(false),
        }}
      />
      {/* RECEPCION PARCIAL */}
      <AdvancedDialog
        type="confirmation"
        onOpenChange={setOpenRecibirParcial}
        open={openRecibirParcial}
        title="Confirmar recepción parcial"
        description="Solo se ingresarán al stock los productos seleccionados. El resto permanecerá pendiente."
        question="¿Deseas continuar con la recepción parcial? Esta acción registrará únicamente los productos seleccionados y no se puede revertir.

Si existe un presupuesto asociado, el monto correspondiente a esta recepción será ejecutado y descontado del saldo disponible."
        children={<></>}
        maxWidth="lg"
        confirmButton={{
          label: "Confirmar recepción parcial",
          disabled: handleRecepcionarParcial.isPending,
          loading: handleRecepcionarParcial.isPending,
          loadingText: "Procesando recepción...",
          onClick: handleCreateRecepcionParcial,
        }}
        cancelButton={{
          label: "Cancelar",
          disabled: handleRecepcionarParcial.isPending,
          loadingText: "Cancelando...",
          onClick: () => setOpenRecibirParcial(false),
        }}
      />
      {/* Form previo a confirmar */}

      {/* FORM PREVIO A RECEPCION PARCIAL */}
      <PaymentMethodCompraDialogConfirm
        isBankMethod={isBankMethod}
        isCashMethod={isCashMethod}
        openFormPaymentDialog={openFormPaymentDialog}
        setOpenFormPaymentDialog={setOpenFormPaymentDialog}
        observaciones={observaciones}
        setObservaciones={setObservaciones}
        proveedorSelected={proveedorSelected}
        setProveedorSelected={setProveedorSelected}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        optionsCajas={optionsCajas}
        handleSelectCaja={handleSelectCaja}
        cajaSelected={cajaSelected}
        setCajaSelected={setCajaSelected}
        cajaTieneSaldo={cajaTieneSaldo}
        montoRecepcion={montoRecepcion}
        cajasDisponibles={cajasDisponibles}
        cuentaBancariaSelected={cuentaBancariaSelected}
        setCuentaBancariaSelected={setCuentaBancariaSelected}
        cuentasBancarias={cuentasBancarias}
        canContinue={canContinue}
        onContinue={onContinueFromPayment}
        proveedores={proveedores}
      />

      <CostosAsociadosDialog
        open={openCostoDialog}
        onOpenChange={(v) => {
          setOpenCostoDialog(v);
          if (!v && !costoStepDone) {
            if (recepcionFlow === "PARCIAL") setOpenRecibirParcial(true);
            else setOpenSendStock(true);
          }
        }}
        compraId={compraId}
        sucursalId={sucursalId}
        proveedorId={registro.proveedor?.id ?? 1}
        compraSubtotal={montoRecepcion}
        cajasDisponibles={cajasDisponibles.map((c) => ({
          id: c.id,
          label: `Caja #${c.id}`,
          disponibleEnCaja: c.disponibleEnCaja,
        }))}
        cuentasBancarias={cuentasBancarias}
        defaultMetodoPago={""}
        onSubmit={({ mf, prorrateo }: CostosAsociadosDialogResult) => {
          setMfDraft(mf);
          setProrrateoMeta(prorrateo ?? null);
          setCostoStepDone(true);
          setOpenCostoDialog(false);
          if (recepcionFlow === "PARCIAL") setOpenRecibirParcial(true);
          else setOpenSendStock(true);
        }}
      />
    </PageTransition>
  );
}
