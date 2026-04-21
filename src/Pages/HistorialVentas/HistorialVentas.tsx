import { useDeferredValue, useMemo, useState } from "react";
import { useStore } from "@/components/Context/ContextSucursal";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  TrendingUp,
  X,
} from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";
import { formattMonedaGT } from "@/utils/formattMoneda";
import {
  PaginationMeta,
  TipoComprobante,
  VentaResumen,
  VentasApiResponse,
} from "./interfaces/VentasHistorialResponse";
import TableVentas from "./table/TableVentas";
import {
  useApiMutation,
  useApiQuery,
} from "@/hooks/genericoCall/genericoCallHook";
import VentaDetalleDialog from "../POS/VentaDetalleDialog";
import { AdvancedDialog } from "@/utils/components/AdvancedDialog";
import { useQueryClient } from "@tanstack/react-query";
import { ventasHistorialKeys } from "./Keys/query";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import {
  downloadFile,
  useReportUtilidad,
  useReportVentas,
  UtilidadReportQuery,
} from "@/hooks/use-reports/use-report-excel";
import { PageTransition } from "@/components/Transition/layout-transition";

registerLocale("es", es);

type QueryVentasUI = {
  page: number;
  limit: number;
  sortBy: "fechaVenta" | "totalVenta" | "clienteNombre";
  sortDir: "asc" | "desc";
  sucursalId: number;
  texto?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
  referenciaPago?: string;
  codigoItem?: string;
  fechaDesde?: string; // 'YYYY-MM-DD'
  fechaHasta?: string; // 'YYYY-MM-DD'
  montoMin?: number;
  montoMax?: number;
  tipoComprobante?: TipoComprobante[];
  cats?: number[];
  //flags de filtrado ventas mias o global
  isVendedor: boolean;
  usuarioId?: number;
  metodoPago?: string[];
};

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
  sortBy: "fechaVenta",
  sortDir: "desc",
};

function MultiChecks({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="border rounded-md p-2">
      <div className="text-xs font-medium mb-1">{label}</div>
      <div className="flex flex-wrap gap-3">
        {options.map((op) => {
          const checked = values.includes(op.value);
          return (
            <label
              key={op.value}
              className="text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="accent-primary"
                checked={checked}
                onChange={() => {
                  const next = checked
                    ? values.filter((v) => v !== op.value)
                    : [...values, op.value];
                  onChange(next);
                }}
              />
              <span>{op.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function HistorialVentasMain() {
  const queryClient = useQueryClient();
  const sucursalId = useStore((s) => s.sucursalId) ?? 0;
  const userId = useStore((s) => s.userId) ?? 0;
  const rol = useStore((s) => s.userRol) ?? "";
  const [texto, setTexto] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  const [montoMin, setMontoMin] = useState<string>("");
  const [montoMax, setMontoMax] = useState<string>("");
  const [metodosPago, setMetodosPago] = useState<string[]>([]);
  const [comprobantes, setComprobantes] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [sortBy, setSortBy] = useState<QueryVentasUI["sortBy"]>("fechaVenta");
  const [sortDir, setSortDir] = useState<QueryVentasUI["sortDir"]>("desc");
  const [isOpenDetalle, setIsOpenDetalle] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] =
    useState<VentaResumen | null>(null);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [ventaEliminar, setVentaEliminar] = useState<{
    venta: VentaResumen | null;
    motivo: string;
    adminPassword: string;
  }>({ venta: null, motivo: "", adminPassword: "" });
  const textoDeferred = useDeferredValue(texto);
  const queryParams: QueryVentasUI = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      sortDir,
      sucursalId,
      texto: textoDeferred || undefined,
      fechaDesde: fechaDesde
        ? dayjs(fechaDesde).format("YYYY-MM-DD")
        : undefined,
      fechaHasta: fechaHasta
        ? dayjs(fechaHasta).format("YYYY-MM-DD")
        : undefined,
      montoMin: montoMin ? Number(montoMin) : undefined,
      montoMax: montoMax ? Number(montoMax) : undefined,
      isVendedor: rol !== "ADMIN",
      tipoComprobante: comprobantes.length
        ? (comprobantes as TipoComprobante[])
        : undefined,
      metodoPago: metodosPago.length ? metodosPago : undefined,
    }),
    [
      page,
      limit,
      sortBy,
      sortDir,
      sucursalId,
      textoDeferred,
      fechaDesde,
      fechaHasta,
      montoMin,
      montoMax,
      rol,
      comprobantes,
      metodosPago,
    ],
  );

  const useCreateReporteUtilidad = useReportUtilidad();
  const useCreateReporteVentas = useReportVentas();
  // ---------- Fetch con tu wrapper ----------
  const {
    data: ventasPage,
    isFetching,
    isError,
  } = useApiQuery<VentasApiResponse>(
    ventasHistorialKeys.listSucursal(sucursalId, queryParams),
    `/venta/find-my-sucursal-sales/${sucursalId}`,
    { params: queryParams },
    {
      enabled: Number.isFinite(sucursalId) && sucursalId > 0,

      staleTime: 0, // nunca considerado "fresh"
      refetchOnMount: "always", // siempre refetch al montar
      refetchOnReconnect: true, // refetch al volver conexión
      refetchOnWindowFocus: true, // refetch al volver a la pestaña
    },
  );

  // ---------- Mutación para eliminar venta ----------
  const deleteMutation = useApiMutation<
    any,
    {
      usuarioId: number;
      motivo: string;
      ventaId: number;
      sucursalId: number;
      // Ajustado a nuevo payload de items
      productos: {
        cantidad: number;
        precioVenta: number;
        type: "PRODUCTO" | "PRESENTACION";
        productoId?: number;
        presentacionId?: number;
      }[];
      totalVenta: number;
      adminPassword: string;
    }
  >("post", "/sale-deleted", undefined, {
    onSuccess: () => {
      setIsOpenDelete(false);
      setVentaEliminar({ venta: null, motivo: "", adminPassword: "" });
      queryClient.invalidateQueries({ queryKey: ventasHistorialKeys.all });
    },
  });

  const meta = ventasPage?.meta ?? defaultMeta;

  // ---------- Handlers ----------
  const onChangePage = (next: number) => setPage(next);
  const onChangeLimit = (next: number) => {
    setLimit(next);
    setPage(1);
  };

  const onSortChange = (
    by: PaginationMeta["sortBy"],
    dir: PaginationMeta["sortDir"],
  ) => {
    setSortBy(by as any);
    setSortDir(dir);
    setPage(1);
  };

  const handleViewVenta = (v: VentaResumen) => {
    setVentaSeleccionada(v);
    setIsOpenDetalle(true);
  };

  const handleAskDelete = (v: VentaResumen) => {
    setVentaEliminar({ venta: v, motivo: "", adminPassword: "" });
    setIsOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    const v = ventaEliminar.venta!;
    if (!ventaEliminar.adminPassword) {
      toast.info("Ingrese la contraseña de administrador");
      return;
    }
    if (!ventaEliminar.motivo.trim()) {
      toast.info("Ingrese el motivo de la eliminación");
      return;
    }
    const productos = (v.items ?? []).map((it) => ({
      cantidad: it.cantidad,
      precioVenta: it.precioVenta,
      type: it.type,
      productoId: it.type === "PRODUCTO" ? it.productoId : undefined,
      presentacionId:
        it.type === "PRESENTACION" ? it.presentacionId : undefined,
    }));

    const payload = {
      usuarioId: userId,
      motivo: ventaEliminar.motivo,
      totalVenta: v.total,
      productos,
      ventaId: v.id,
      sucursalId,
      adminPassword: ventaEliminar.adminPassword,
    };

    toast.promise(deleteMutation.mutateAsync(payload), {
      loading: "Eliminando registro...",
      success: "Venta eliminada",
      error: (error) => getApiErrorMessageAxios(error),
    });
  };

  const totalVentas = useMemo(() => {
    const total =
      ventasPage?.data.reduce((acc, venta) => acc + venta.total, 0) ?? 0;

    return formattMonedaGT(total);
  }, [ventasPage]);

  // ---------- UI ----------
  if (isError) {
    return (
      <div className="p-6 text-center text-destructive">
        Error al cargar ventas.
      </div>
    );
  }

  if (!ventasPage) {
    return (
      <div className="p-6 text-center text-muted-foreground">No hay datos.</div>
    );
  }
  function handleGenerarReporte(): void {
    const dto: UtilidadReportQuery = {
      fechaFin: fechaHasta,
      fechaInicio: fechaDesde,
      comprobantes: comprobantes,
      metodosPago: metodosPago,
      montoMax: montoMax,
      montoMin: montoMin,
    };

    useCreateReporteVentas.mutateAsync(dto, {
      onSuccess: (data: any) => {
        downloadFile(data, `Historial_Ventas_${Date.now()}.xlsx`);
        toast.success("Reporte de utilidad descargado");
      },
      onError: (error) => {
        toast.error("Error al generar reporte");
        toast.error(getApiErrorMessageAxios(error));
      },
    });
  }

  function handleGenerarReporteUtilidad() {
    const dto: UtilidadReportQuery = {
      fechaFin: fechaHasta,
      fechaInicio: fechaDesde,
      comprobantes: comprobantes,
      metodosPago: metodosPago,
      montoMax: montoMax,
      montoMin: montoMin,
    };

    useCreateReporteUtilidad.mutateAsync(dto, {
      onSuccess: (data: any) => {
        downloadFile(data, `Utilidad_Reporte_${Date.now()}.xlsx`);
        toast.success("Reporte de utilidad descargado");
      },
      onError: (error) => {
        toast.error("Error al generar reporte");
        toast.error(getApiErrorMessageAxios(error));
      },
    });
  }

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Historial de Ventas">
      {/* Filtros */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          {/* Fila 1: Texto + Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">
                Texto
              </label>
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar cliente, referencia, código, etc."
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Desde
              </label>
              <DatePicker
                locale="es"
                selected={fechaDesde}
                onChange={(d) => {
                  setFechaDesde(d);
                  setPage(1);
                }}
                isClearable
                placeholderText="Inicio"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Hasta
              </label>
              <DatePicker
                locale="es"
                selected={fechaHasta}
                onChange={(d) => {
                  setFechaHasta(d);
                  setPage(1);
                }}
                isClearable
                placeholderText="Fin"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Fila 2: Montos + Checks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Monto mínimo
              </label>
              <Input
                inputMode="decimal"
                value={montoMin}
                onChange={(e) => {
                  setMontoMin(e.target.value);
                  setPage(1);
                }}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Monto máximo
              </label>
              <Input
                inputMode="decimal"
                value={montoMax}
                onChange={(e) => {
                  setMontoMax(e.target.value);
                  setPage(1);
                }}
                placeholder="9999.00"
              />
            </div>
            <MultiChecks
              label="Método de pago"
              options={[
                { value: "EFECTIVO", label: "Contado" },
                { value: "TARJETA", label: "Tarjeta" },
                { value: "TRANSFERENCIA", label: "Transferencia" },
                { value: "CREDITO", label: "Crédito" },
                { value: "OTRO", label: "Otro" },
              ]}
              values={metodosPago}
              onChange={(v) => {
                setMetodosPago(v);
                setPage(1);
              }}
            />
            <MultiChecks
              label="Comprobante"
              options={[
                { value: "RECIBO", label: "Recibo" },
                { value: "FACTURA", label: "Factura" },
              ]}
              values={comprobantes}
              onChange={(v) => {
                setComprobantes(v);
                setPage(1);
              }}
            />
          </div>

          {/* Fila 3: Acciones */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
            {/* Limpiar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTexto("");
                setFechaDesde(null);
                setFechaHasta(null);
                setMontoMin("");
                setMontoMax("");
                setMetodosPago([]);
                setComprobantes([]);
                setSortBy("fechaVenta");
                setSortDir("desc");
                setPage(1);
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Limpiar
            </Button>

            {/* Total inline */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-dashed border-border">
              <span className="text-xs ">Total:</span>
              <span className="text-sm font-semibold ">
                {totalVentas ?? "--.--"}
              </span>
            </div>

            {/* Reportes + Límite → derecha */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleGenerarReporte}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                Ventas
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleGenerarReporteUtilidad}
              >
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                Utilidad
              </Button>

              <div className="flex items-center gap-1.5 border-l pl-2">
                <span className="text-xs text-muted-foreground">Límite</span>
                <select
                  className="h-8 rounded-md border bg-background px-2 text-sm"
                  value={limit}
                  onChange={(e) => onChangeLimit(Number(e.target.value))}
                >
                  {[10, 20, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Selección actual (para eliminar) */}
      {ventaEliminar.venta && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">#{ventaEliminar.venta.id}</Badge>
          <span className="text-muted-foreground">
            {ventaEliminar.venta.clienteNombre ?? "CF"}
          </span>
          <span className="ml-2 font-medium">
            {formattMonedaGT(ventaEliminar.venta.total)}
          </span>
        </div>
      )}

      {/* Tabla */}
      <TableVentas
        pageData={ventasPage}
        isLoading={isFetching}
        onSortChange={onSortChange}
        onViewVenta={handleViewVenta}
        onDeleteVenta={handleAskDelete}
      />

      <VentaDetalleDialog
        open={isOpenDetalle}
        onOpenChange={setIsOpenDetalle}
        venta={ventaSeleccionada as any}
        onDeleteClick={handleAskDelete}
      />

      {/* Paginación server-side */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChangePage(1)}
          disabled={!meta.hasPrev}
        >
          Primero
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChangePage(Math.max(1, meta.page - 1))}
          disabled={!meta.hasPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm">
          Página <b>{meta.page}</b> de <b>{meta.totalPages || 1}</b>
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onChangePage(Math.min(meta.totalPages || 1, meta.page + 1))
          }
          disabled={!meta.hasNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChangePage(meta.totalPages || 1)}
          disabled={!meta.hasNext}
        >
          Último
        </Button>
      </div>

      {/* Dialog Eliminar */}
      <AdvancedDialog
        type="warning"
        open={isOpenDelete}
        onOpenChange={setIsOpenDelete}
        title="Eliminación de venta"
        description="Se procederá a eliminar esta venta y los registros ligados a ella."
        question="¿Estás seguro de ello?"
        confirmButton={{
          label: "Si, continuar y eliminar",
          onClick: handleConfirmDelete,
          loading: deleteMutation.isPending,
          loadingText: "Eliminando registro...",
          disabled: deleteMutation.isPending,
        }}
        cancelButton={{
          label: "Cancelar",
          onClick: () => {
            setIsOpenDelete(false);
          },
          disabled: deleteMutation.isPending,
          loadingText: "Cancelando...",
        }}
        children={
          <div className="space-y-2">
            <Textarea
              placeholder="Motivo de la eliminación"
              value={ventaEliminar.motivo}
              onChange={(e) =>
                setVentaEliminar((prev) => ({
                  ...prev,
                  motivo: e.target.value,
                }))
              }
            />
            <Input
              type="password"
              placeholder="Contraseña de administrador"
              value={ventaEliminar.adminPassword}
              onChange={(e) =>
                setVentaEliminar((prev) => ({
                  ...prev,
                  adminPassword: e.target.value,
                }))
              }
            />
          </div>
        }
      />
    </PageTransition>
  );
}
