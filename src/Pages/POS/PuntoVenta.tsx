"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { toast } from "sonner";
import { CheckCircle, Coins, Package, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SelectM from "react-select";

import { useStore } from "@/components/Context/ContextSucursal";
import { formatearMoneda } from "@/Crm/CrmServices/crm-service.types";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { formatMonedaGT } from "../Compras/compras.utils";
import { formattFecha } from "../Utils/Utils";
import { PageTransition } from "@/components/Transition/layout-transition";

import { useClientes } from "@/hooks/use-clientes/use-clientes";
import { useCreateVenta } from "@/hooks/use-create-venta/use-create-venta";
import { useGetCategorias } from "@/hooks/use-categorias/use-categorias";
import { useTiposPresentaciones } from "@/hooks/use-tipos-presentaciones/use-tipos-presentaciones";
import { useCreateCreditoRequest } from "@/hooks/use-authorization-credito/use-authorization";
import { useCreatePriceRequest } from "@/hooks/use-create-price-request/use-create-price-request";
import { NewQueryPOS, useFetchVentas } from "@/hooks/use-ventas/use-ventas";

import CartCheckout from "./CartCheckout";
import DialogImages from "../DialogImages";
import CreditoForm from "./credito-props-components/credito-form-component";
import { ComprobanteSelector } from "./Components/ComprobanteSelector";

import { TipoComprobante } from "./interfaces";
import { MetodoPagoMainPOS } from "./interfaces/methodPayment";
import type { NewQueryDTO } from "./interfaces/interfaces";
import { ProductoData } from "./interfaces/newProductsPOSResponse";
import { FormCreditoState } from "./credito-props-components/credito-venta.interfaces";

import type {
  CartItem,
  Customer,
  imagenesProducto,
  Precios,
  ProductoPOS,
  RolPrecio,
  SourceType,
} from "@/Types/POS/interfaces";
import TablePOS from "./table/header";

export type { imagenesProducto, Precios };

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function PuntoVenta() {
  const userId = useStore((state) => state.userId) ?? 0;
  const userRol = useStore((state) => state.userRol) ?? "";
  const sucursalId = useStore((state) => state.sucursalId) ?? 0;

  // ── Cart ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Dialogs ───────────────────────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openSection, setOpenSection] = useState(false);
  const [openReques, setOpenRequest] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [openCreateRequest, setOpenCreateRequest] = useState(false);

  // ── Payment & checkout ────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<MetodoPagoMainPOS>(
    MetodoPagoMainPOS.EFECTIVO,
  );
  const [tipoComprobante, setTipoComprobante] =
    useState<TipoComprobante | null>(TipoComprobante.RECIBO);
  const [referenciaPago, setReferenciaPago] = useState("");
  const [imei, setImei] = useState("");
  const [isDisableButton, setIsDisableButton] = useState(false);

  // ── Venta response ────────────────────────────────────────────────────────
  const [ventaResponse, setVentaResponse] = useState<{
    id: number;
    fechaVenta: string;
    totalVenta: number;
  } | null>(null);

  // ── Price request ─────────────────────────────────────────────────────────
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [precioReques, setPrecioRequest] = useState<number | null>(null);

  // ── Images ────────────────────────────────────────────────────────────────
  const [imagesProduct, setImagesProduct] = useState<string[]>([]);

  // ── Customer ──────────────────────────────────────────────────────────────
  const [selectedCustomerID, setSelectedCustomerID] = useState<Customer | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("existing");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [dpi, setDpi] = useState("");
  const [nit, setNit] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // ── Pagination & search ───────────────────────────────────────────────────
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [queryOptions, setQueryOptions] = useState<NewQueryDTO>({
    cats: [],
    codigoItem: "",
    codigoProveedor: "",
    nombreItem: "",
    priceRange: "",
    tipoEmpaque: [],
    sucursalId,
    limit,
    page,
  });

  useEffect(() => {
    setQueryOptions((prev) => ({ ...prev, sucursalId, limit, page }));
  }, [sucursalId, limit, page]);

  const [isScannerMode, setIsScannerMode] = useState(true);
  const [scanInput, setScanInput] = useState("");
  const scanInputRef = useRef<HTMLInputElement>(null);

  const handleToggleScannerMode = useCallback(() => {
    setIsScannerMode((prev) => {
      const next = !prev;
      if (next) {
        // Al activar, forzar focus al siguiente frame
        setTimeout(() => scanInputRef.current?.focus(), 50);
      }
      return next;
    });
  }, []);

  /** Atajo de teclado global: F2 para alternar modo rápido */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        handleToggleScannerMode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleToggleScannerMode]);

  /** Autofocus al montar la página (isScannerMode arranca en true) */
  useEffect(() => {
    setTimeout(() => scanInputRef.current?.focus(), 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── API params memo ───────────────────────────────────────────────────────
  const apiParams = useMemo<NewQueryPOS>(() => {
    const p: Partial<NewQueryPOS> = {
      sucursalId,
      limit,
      page,
      q: debouncedSearch || undefined,
    };
    if (queryOptions.cats?.length) p.cats = queryOptions.cats;
    if (queryOptions.codigoProveedor)
      p.codigoProveedor = queryOptions.codigoProveedor;
    if (queryOptions.tipoEmpaque) p.tipoEmpaque = queryOptions.tipoEmpaque;
    if (queryOptions.priceRange) p.priceRange = queryOptions.priceRange;
    return p as NewQueryPOS;
  }, [
    debouncedSearch,
    sucursalId,
    limit,
    page,
    queryOptions.cats,
    queryOptions.codigoProveedor,
    queryOptions.tipoEmpaque,
    queryOptions.priceRange,
  ]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const {
    data: productsResponse = {
      data: [],
      meta: {
        limit: 10,
        page: 1,
        totalCount: 0,
        totalPages: 1,
        totals: { presentaciones: 0, productos: 0 },
      },
    },
    refetch: refetchProducts,
    isFetching: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = useFetchVentas(apiParams);

  const {
    data: customersResponse,
    isError: isErrorCustomers,
    error: errorCustomers,
  } = useClientes();

  const { mutateAsync: createSale, isPending: isCreatingSale } =
    useCreateVenta();
  const { mutateAsync: createPriceRequest, isPending: isCreatingPriceRequest } =
    useCreatePriceRequest();
  const {
    mutateAsync: createCreditRequest,
    isPending: isPendingCreditRequest,
  } = useCreateCreditoRequest();
  const { data: tiposPresentacionesResponse } = useTiposPresentaciones();
  const { data: cats } = useGetCategorias();

  const categorias = Array.isArray(cats) ? cats : [];
  const tiposPresentacion = tiposPresentacionesResponse?.data ?? [];

  const productos: ProductoData[] = Array.isArray(productsResponse.data)
    ? productsResponse.data
    : [];

  const meta = productsResponse.meta ?? {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  };

  // Errors
  useEffect(() => {
    if (isErrorProducts && errorProducts)
      toast.error(getApiErrorMessageAxios(errorProducts));
    if (isErrorCustomers && errorCustomers)
      toast.error(getApiErrorMessageAxios(errorCustomers));
  }, [isErrorProducts, errorProducts, isErrorCustomers, errorCustomers]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const handlePageChange = (nextPage: number) =>
    setPage(Math.max(1, Math.min(nextPage, meta.totalPages || 1)));

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const handleSearchItemsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const makeUid = (s: SourceType, id: number) => `${s}-${id}`;

  const addToCart = useCallback((product: ProductoPOS) => {
    const uid = makeUid(product.source, product.id);
    setCart((prev) => {
      const existing = prev.find((i) => i.uid === uid);
      if (existing) {
        return prev.map((i) =>
          i.uid === uid ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      const initial = product.precios?.[0];
      const newItem: CartItem = {
        uid,
        id: product.id,
        source: product.source,
        nombre: product.nombre,
        precios: product.precios,
        stock: product.stock,
        quantity: 1,
        selectedPriceId: initial?.id ?? 0,
        selectedPrice: initial?.precio ?? 0,
        selectedPriceRole:
          (initial?.rol as RolPrecio) ?? ("PUBLICO" as RolPrecio),
      };
      return [...prev, newItem];
    });
  }, []);

  function defaultMapToCartProduct(p: ProductoData): ProductoPOS {
    return {
      id: p.id,
      source: (p.__source as SourceType) ?? "producto",
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precioVenta: 0,
      codigoProducto: p.codigoProducto,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      stock: (p.stocks ?? []).map((s) => ({
        id: s.id,
        cantidad: s.cantidad,
        fechaIngreso: s.fechaIngreso || "",
        fechaVencimiento: s.fechaVencimiento || "",
      })),
      precios: (p.precios ?? []).map((pr) => ({
        id: pr.id,
        precio: Number(pr.precio) || 0,
        rol: (pr.rol as RolPrecio) ?? ("PUBLICO" as RolPrecio),
      })),
      imagenesProducto: (p.images ?? [])
        .filter((im) => !!im?.url)
        .map((im) => ({ id: im.id ?? 0, url: im.url ?? "" })),
    };
  }

  const handleImageClick = (images: string[]) => {
    setOpenImage(true);
    setImagesProduct(images);
  };

  const getRemainingForRow = useCallback(
    (p: ProductoData) => {
      const source = (p.__source as SourceType) ?? "producto";
      const uid = makeUid(source, p.id);
      const totalStock = (p.stocks ?? []).reduce((a, s) => a + s.cantidad, 0);
      const reserved = cart.find((i) => i.uid === uid)?.quantity ?? 0;
      return Math.max(0, totalStock - reserved);
    },
    [cart],
  );

  const updateQuantityByUid = (uid: string, qty: number) =>
    setCart((prev) =>
      prev.map((i) => (i.uid === uid ? { ...i, quantity: qty } : i)),
    );

  const updatePriceByUid = (
    uid: string,
    newPrice: number,
    newRole: RolPrecio,
  ) =>
    setCart((prev) =>
      prev.map((i) =>
        i.uid === uid
          ? {
              ...i,
              selectedPrice: newPrice,
              selectedPriceRole: newRole,
              selectedPriceId:
                i.precios.find(
                  (p) => p.precio === newPrice && p.rol === newRole,
                )?.id ?? i.selectedPriceId,
            }
          : i,
      ),
    );

  const removeFromCartByUid = (uid: string) =>
    setCart((prev) => prev.filter((i) => i.uid !== uid));

  // ── Reset state after sale ────────────────────────────────────────────────
  /** Limpia todo y devuelve el POS a estado inicial, listo para la siguiente venta */
  const resetPOS = useCallback(() => {
    setCart([]);
    setImei("");
    setReferenciaPago("");
    setPaymentMethod(MetodoPagoMainPOS.CONTADO);
    setTipoComprobante(TipoComprobante.RECIBO);
    setSelectedCustomerID(null);
    setNombre("");
    setApellidos("");
    setTelefono("");
    setDireccion("");
    setDpi("");
    setNit("");
    setObservaciones("");
    setScanInput("");
    setSearch("");
    setPage(1);
  }, []);

  // ── Credito state ─────────────────────────────────────────────────────────
  const totalCarrito = useMemo(
    () =>
      cart.reduce((acc, prod) => acc + prod.selectedPrice * prod.quantity, 0),
    [cart],
  );
  const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  const [creditoForm, setCreditoForm] = useState<FormCreditoState>(() => ({
    sucursalId,
    solicitadoPorId: userId,
    clienteId: selectedCustomerID?.id,
    nombreCliente: "",
    telefonoCliente: "",
    direccionCliente: "",
    totalPropuesto: r2(totalCarrito),
    cuotaInicialPropuesta: 0,
    cuotasTotalesPropuestas: 2,
    interesTipo: "NONE",
    interesPorcentaje: 0,
    interesSobreVenta: 0,
    planCuotaModo: "IGUALES",
    diasEntrePagos: 15,
    fechaPrimeraCuota: dayjs()
      .tz("America/Guatemala")
      .add(15, "day")
      .format("YYYY-MM-DD"),
    comentario: "",
    garantiaMeses: 0,
    testigos: undefined,
    cuotasPropuestas: [],
    lineas: [],
  }));

  type LineaForm = NonNullable<FormCreditoState["lineas"]>[number];
  const mapCartToLineas = useCallback(
    (items: CartItem[]): NonNullable<FormCreditoState["lineas"]> =>
      items.map<LineaForm>((i) => ({
        productoId: i.source === "presentacion" ? undefined : i.id,
        presentacionId: i.source === "presentacion" ? i.id : undefined,
        cantidad: i.quantity,
        precioUnitario: i.selectedPrice,
        precioSeleccionadoId: i.selectedPriceId,
        subtotal:
          Math.round((i.quantity * i.selectedPrice + Number.EPSILON) * 100) /
          100,
        nombreProductoSnapshot: i.nombre,
        presentacionNombreSnapshot:
          i.source === "presentacion" ? i.nombre : undefined,
        codigoBarrasSnapshot: undefined,
      })),
    [],
  );

  useEffect(() => {
    setCreditoForm((f) => ({
      ...f,
      sucursalId,
      clienteId: selectedCustomerID?.id,
      totalPropuesto: r2(totalCarrito),
    }));
  }, [sucursalId, selectedCustomerID?.id, totalCarrito]);

  useEffect(() => {
    setCreditoForm((f) => ({ ...f, lineas: mapCartToLineas(cart) }));
  }, [cart, mapCartToLineas]);

  useEffect(() => {
    if (paymentMethod === MetodoPagoMainPOS.CREDITO) {
      setCreditoForm((f) => ({
        ...f,
        planCuotaModo: f.planCuotaModo ?? "IGUALES",
        interesTipo: f.interesTipo ?? "NONE",
        cuotasTotalesPropuestas: f.cuotasTotalesPropuestas || 6,
        diasEntrePagos: f.diasEntrePagos || 30,
        fechaPrimeraCuota:
          f.fechaPrimeraCuota || dayjs().add(30, "day").format("YYYY-MM-DD"),
      }));
    }
  }, [paymentMethod]);

  // ── Customers ─────────────────────────────────────────────────────────────
  const customerOptions = useMemo(
    () =>
      (customersResponse ?? []).map((c) => ({
        value: c.id,
        label: `${c.nombre} ${c?.apellidos ?? ""} ${c.telefono ? `(${c.telefono})` : ""} ${c.dpi ? `DPI: ${c.dpi}` : "DPI: N/A"} ${c.nit ? `NIT: ${c.nit}` : "NIT: N/A"} ${c.iPInternet ? `IP: ${c.iPInternet}` : ""}`,
      })),
    [customersResponse],
  );

  // ── Validations ───────────────────────────────────────────────────────────
  const isReferenceInvalid =
    paymentMethod === "TRANSFERENCIA" && !referenciaPago;
  const isButtonDisabled =
    isDisableButton || isReferenceInvalid || isCreatingSale;
  const isCreditoVenta = paymentMethod === MetodoPagoMainPOS.CREDITO;

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleMakeRequest() {
    if (precioReques && precioReques <= 0) {
      toast.info("La cantidad a solicitar no debe ser negativa");
      return;
    }
    if (!selectedProductId) {
      toast.info("Debe seleccionar un producto primero");
      return;
    }
    try {
      await createPriceRequest({
        productoId: Number(selectedProductId),
        precioSolicitado: precioReques,
        solicitadoPorId: userId,
      });
      toast.success(
        "Solicitud enviada, esperando respuesta del administrador...",
      );
      setPrecioRequest(null);
      setSelectedProductId("");
      setOpenRequest(false);
    } catch (error) {
      toast.error(getApiErrorMessageAxios(error));
    }
  }

  const handleCreateCreditRequest = async (payload: any) => {
    try {
      await toast.promise(createCreditRequest(payload), {
        success: "Crédito enviado para autorización...",
        loading: "Enviando solicitud de aprobación de crédito",
        error: (error) => getApiErrorMessageAxios(error),
      });
    } catch (error) {
      toast.error(getApiErrorMessageAxios(error));
    }
  };

  const handleCompleteSale = async () => {
    setIsDisableButton(true);

    const saleData = {
      actorRol: userRol,
      usuarioId: userId,
      sucursalId,
      clienteId: selectedCustomerID?.id ?? null,
      productos: cart.map((item) => ({
        cantidad: item.quantity,
        selectedPriceId: item.selectedPriceId,
        ...(item.source === "presentacion"
          ? { presentacionId: item.id }
          : { productoId: item.id }),
      })),
      metodoPago: paymentMethod || "CONTADO",
      tipoComprobante,
      referenciaPago,
      monto: totalCarrito,
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      dpi: dpi.trim(),
      nit: nit.trim(),
      observaciones: observaciones.trim(),
      imei: imei.trim(),
    };

    const isCustomerInfoProvided = !!saleData.nombre && !!saleData.telefono;
    if (
      saleData.monto > 1000 &&
      !saleData.clienteId &&
      !isCustomerInfoProvided
    ) {
      toast.warning(
        "Para ventas mayores a 1000 es necesario ingresar o seleccionar un cliente",
      );
      setIsDisableButton(false);
      return;
    }

    if (!tipoComprobante) {
      toast.info("Seleccione Recibo o Factura");
      setIsDisableButton(false);
      return;
    }

    try {
      const resp = await createSale(saleData);
      toast.success("Venta completada con éxito");
      setVentaResponse(resp);
      setIsDialogOpen(false);
      refetchProducts();
      // Resetear POS (también re-focaliza el escáner si está en modo rápido)
      resetPOS();
      setTimeout(() => setOpenSection(true), 200);
    } catch (error) {
      toast.error(getApiErrorMessageAxios(error));
    } finally {
      setTimeout(() => setIsDisableButton(false), 300);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageTransition fallbackBackTo="/" titleHeader="Punto Venta">
      <div
        className="
          grid grid-cols-1 gap-4 items-start
          md:[grid-template-columns:minmax(0,1fr)_clamp(360px,40vw,420px)]
          xl:[grid-template-columns:minmax(0,1fr)_clamp(380px,32vw,440px)]
        "
      >
        {/* ── Tabla de productos ─────────────────────────────────────────── */}
        <div className="min-w-0">
          <TablePOS
            categorias={categorias}
            tiposPresentacion={tiposPresentacion}
            searchValue={search}
            defaultMapToCartProduct={defaultMapToCartProduct}
            addToCart={addToCart}
            handleImageClick={handleImageClick}
            isLoadingProducts={isLoadingProducts}
            handleSearchItemsInput={handleSearchItemsInput}
            queryOptions={queryOptions}
            setQueryOptions={setQueryOptions}
            data={productos}
            page={meta.page}
            limit={meta.limit}
            totalPages={meta.totalPages}
            totalCount={meta.totalCount}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            getRemainingFor={getRemainingForRow}
            // Modo rápido
            isScannerMode={isScannerMode}
            scanInput={scanInput}
            onToggleScannerMode={handleToggleScannerMode}
            onScanInputChange={(value) => {
              setScanInput(value);
              // Sincronizar con el estado de búsqueda para que la tabla filtre
              setSearch(value);
              setPage(1);
            }}
            scanInputRef={scanInputRef}
          />
        </div>

        {/* ── Carrito & Checkout ─────────────────────────────────────────── */}
        <div className="min-w-0">
          <CartCheckout
            nit={nit}
            setNit={setNit}
            userRol={userRol}
            isCreditoVenta={isCreditoVenta}
            apellidos={apellidos}
            setApellidos={setApellidos}
            cart={cart}
            setReferenciaPago={setReferenciaPago}
            referenciaPago={referenciaPago}
            tipoComprobante={tipoComprobante}
            setTipoComprobante={setTipoComprobante}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            imei={imei}
            setImei={setImei}
            selectedCustomerID={selectedCustomerID}
            setSelectedCustomerID={setSelectedCustomerID}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            nombre={nombre}
            setNombre={setNombre}
            telefono={telefono}
            setTelefono={setTelefono}
            dpi={dpi}
            setDpi={setDpi}
            direccion={direccion}
            setDireccion={setDireccion}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            customerOptions={customerOptions}
            onUpdateQuantity={updateQuantityByUid}
            onUpdatePrice={updatePriceByUid}
            onRemoveFromCart={removeFromCartByUid}
            onCompleteSale={() => setIsDialogOpen(true)}
            formatCurrency={(n) => formatMonedaGT(n)}
          />
        </div>
      </div>

      {/* ── Crédito ────────────────────────────────────────────────────────── */}
      {isCreditoVenta && (
        <CreditoForm
          userRol={userRol}
          openCreateRequest={openCreateRequest}
          setOpenCreateRequest={setOpenCreateRequest}
          value={creditoForm}
          onChange={setCreditoForm}
          handleCreateCreditRequest={handleCreateCreditRequest}
          isPendingCreditRequest={isPendingCreditRequest}
        />
      )}

      {/* ── Petición de precio especial ─────────────────────────────────────── */}
      <div className="mt-10">
        <Card className="shadow-sm rounded-lg border overflow-hidden">
          <CardHeader className="p-5">
            <CardTitle className="text-base font-semibold">
              Petición de precio especial
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Al solicitar un precio especial, esa instancia sólo se podrá usar
              en una venta.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium">Producto</Label>
                <SelectM
                  placeholder="Seleccionar producto"
                  options={productos.map((p) => ({
                    value: String(p.id),
                    label: `${p.nombre} (${p.codigoProducto})`,
                  }))}
                  className="basic-select text-sm text-black"
                  classNamePrefix="select"
                  onChange={(opt) => setSelectedProductId(opt?.value ?? "")}
                  value={
                    selectedProductId
                      ? {
                          value: selectedProductId,
                          label: `${productos.find((p) => String(p.id) === selectedProductId)?.nombre} (${productos.find((p) => String(p.id) === selectedProductId)?.codigoProducto})`,
                        }
                      : null
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium">Precio Requerido</Label>
                <Input
                  type="number"
                  className="h-9 text-sm"
                  placeholder="100.00"
                  value={precioReques ?? ""}
                  onChange={(e) =>
                    setPrecioRequest(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
              </div>
            </div>
            <Button
              onClick={() => setOpenRequest(true)}
              variant="default"
              className="w-full py-2 text-sm"
              disabled={isCreatingPriceRequest}
            >
              Solicitar precio especial
            </Button>

            <Dialog open={openReques} onOpenChange={setOpenRequest}>
              <DialogContent className="w-full max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold text-center">
                    Solicitar precio especial
                  </DialogTitle>
                  <DialogDescription className="text-xs text-center text-muted-foreground">
                    Esta instancia sólo se podrá aplicar a una venta.
                    ¿Continuar?
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleMakeRequest}
                    disabled={
                      !precioReques ||
                      !selectedProductId ||
                      isCreatingPriceRequest
                    }
                    size="sm"
                  >
                    Confirmar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* ── Imágenes ──────────────────────────────────────────────────────── */}
      <DialogImages
        images={imagesProduct}
        openImage={openImage}
        setOpenImage={setOpenImage}
      />

      {/* ── Venta exitosa ─────────────────────────────────────────────────── */}
      <Dialog
        open={openSection}
        onOpenChange={(open) => {
          setOpenSection(open);
          // Al cerrar el dialog de venta exitosa, re-focalizar el escáner si está activo
          if (!open && isScannerMode) {
            setTimeout(() => scanInputRef.current?.focus(), 80);
          }
        }}
      >
        <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
          <div className="relative p-6 pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            </div>
            <h2 className="text-base font-semibold text-center mb-1">
              Venta Registrada
            </h2>
            <p className="text-center text-muted-foreground text-xs">
              La venta se ha procesado exitosamente
            </p>
          </div>

          {ventaResponse && (
            <div className="px-6 py-4 bg-muted/30 border-y">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Número de Venta:
                  </span>
                  <span className="text-sm font-semibold">
                    #{ventaResponse.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Fecha:</span>
                  <span className="text-xs font-semibold">
                    {formattFecha(ventaResponse.fechaVenta)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-base font-bold text-green-600">
                    {formattMonedaGT(ventaResponse.totalVenta)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 pt-4">
            <div className="flex gap-3">
              <Link
                to={`/venta/generar-factura/${ventaResponse?.id}`}
                className="flex-1"
              >
                <Button
                  className="w-full h-9 text-sm bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setOpenSection(false)}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Imprimir Comprobante
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirmar venta ────────────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="bg-muted/30 p-4">
            <DialogHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <DialogTitle className="text-sm font-bold text-center">
                Confirmar Venta
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-4 space-y-4">
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Package className="h-3 w-3" />
                Resumen de productos
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.uid}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-muted-foreground truncate">
                      {item.nombre} × {item.quantity}
                    </span>
                    <span className="font-medium text-muted-foreground">
                      {formatearMoneda(item.selectedPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-green-600" />
                  <span className="font-semibold text-sm">Total</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-green-600">
                    {formatearMoneda(totalCarrito)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {cart.length} {cart.length === 1 ? "artículo" : "artículos"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ComprobanteSelector
                tipo={tipoComprobante}
                setTipo={setTipoComprobante}
              />
            </div>

            {referenciaPago && (
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                <div className="text-xs font-medium text-blue-700">
                  Referencia de Pago
                </div>
                <div className="text-xs font-mono text-blue-800">
                  {referenciaPago}
                </div>
              </div>
            )}

            {isReferenceInvalid && (
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                <div className="text-xs font-medium text-blue-700">
                  El número de boleta no puede estar vacío
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="destructive"
                size="sm"
                className="flex-1 h-8 text-xs"
                disabled={isDisableButton}
              >
                Cancelar
              </Button>
              <Button
                disabled={isButtonDisabled}
                size="sm"
                onClick={handleCompleteSale}
                className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {isDisableButton || isCreatingSale ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Procesando...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Confirmar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
