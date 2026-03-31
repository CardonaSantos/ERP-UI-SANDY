"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/components/Context/ContextSucursal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { formattMoneda } from "../Utils/Utils";
import { AdvancedDialog } from "@/utils/components/AdvancedDialog";
import { useNavigate, useParams } from "react-router-dom";
import { getRequisicionToEdit, updateRequisicion } from "./requisicion.api";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

// Interfaces
interface RequisitionItem {
  productoId: number;
  nombre: string;
  precioCosto: number;
  stockActual: number;
  stockMinimo: number;
  cantidadSugerida: number;
  fechaExpiracion: string | null; // From API, can be string or null
}

type SelectedLine = {
  cantidad: number;
  fechaExpiracion: Date | null; // In state, we use Date object or null
};

interface UpdateRequisitionDto {
  requisicionId: number;
  sucursalId: number;
  usuarioId: number;
  lineas: {
    productoId: number;
    cantidadSugerida: number;
    fechaExpiracion: string | null; // To API, convert back to string or null
  }[];
}

const formatearFecha = (fecha: string) => {
  return dayjs(fecha).format("YYYY-MM-DD");
};

export const RequisitionEditor = () => {
  const sucursalId = useStore((state) => state.sucursalId) ?? 0;
  const usuarioId = useStore((state) => state.userId) ?? 0;
  const { requisicionID } = useParams<{ requisicionID: string }>();
  const requisicionIdNum = requisicionID ? Number(requisicionID) : 0;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<RequisitionItem[]>([]);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [items, setItems] = useState<RequisitionItem[]>([]);
  const [selected, setSelected] = useState<Record<number, SelectedLine>>({}); // Updated type
  const [submitting, setSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  useEffect(() => {
    getRequisicion();
  }, [requisicionIdNum]);

  const getRequisicion = async () => {
    if (!requisicionIdNum) return;
    setLoading(true);
    try {
      const response = await getRequisicionToEdit(requisicionIdNum);
      setItems(response.data);
      setInitialData(response.data); // Store initial data for change detection

      // Initialize selection with all products, converting date string to Date object
      const initialSelected: Record<number, SelectedLine> = Object.fromEntries(
        response.data.map((item: RequisitionItem) => [
          item.productoId,
          {
            cantidad: item.cantidadSugerida,
            fechaExpiracion: item.fechaExpiracion
              ? dayjs(item.fechaExpiracion).toDate()
              : null,
          },
        ])
      );
      setSelected(initialSelected);
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Error al conseguir registro");
    } finally {
      setLoading(false);
    }
  };

  // Detectar cambios
  useEffect(() => {
    if (initialData.length === 0) return;

    const initialSelectedMap = new Map(
      initialData.map((item) => [
        item.productoId,
        {
          cantidad: item.cantidadSugerida,
          fechaExpiracion: item.fechaExpiracion
            ? dayjs(item.fechaExpiracion).format("YYYY-MM-DD")
            : null,
        },
      ])
    );

    const currentSelectedMap = new Map(
      Object.entries(selected).map(([id, data]) => [
        Number(id),
        {
          cantidad: data.cantidad,
          fechaExpiracion: data.fechaExpiracion
            ? dayjs(data.fechaExpiracion).format("YYYY-MM-DD")
            : null,
        },
      ])
    );

    let changesDetected = false;

    if (initialSelectedMap.size !== currentSelectedMap.size) {
      changesDetected = true;
    } else {
      for (const [prodId, initialData] of initialSelectedMap.entries()) {
        const currentData = currentSelectedMap.get(prodId);
        if (
          !currentData ||
          currentData.cantidad !== initialData.cantidad ||
          currentData.fechaExpiracion !== initialData.fechaExpiracion
        ) {
          changesDetected = true;
          break;
        }
      }
    }
    setHasChanges(changesDetected);
  }, [selected, initialData]);

  // Estadísticas
  const selectedCount = Object.keys(selected).length;
  const totalSelectedQty = Object.values(selected).reduce(
    (acc, data) => acc + data.cantidad,
    0
  );
  const totalSelectedCost = items.reduce((acc, item) => {
    const qty = selected[item.productoId]?.cantidad ?? 0;
    return acc + (item.precioCosto ?? 0) * qty;
  }, 0);

  // Función para obtener el nivel de alerta
  const getAlertLevel = (stockActual: number, stockMinimo: number) => {
    const percentage = (stockActual / stockMinimo) * 100;
    if (percentage <= 25) return { level: "critical", color: "destructive" };
    if (percentage <= 50) return { level: "high", color: "destructive" };
    if (percentage <= 75) return { level: "medium", color: "secondary" };
    return { level: "low", color: "outline" };
  };

  // Toggle selección de producto
  const toggle = (prodId: number) => {
    setSelected((prev) => {
      if (prodId in prev) {
        // des-seleccionar
        const { [prodId]: _omit, ...rest } = prev;
        return rest;
      } else {
        // volver a seleccionar con la cantidad y fecha original
        const item = items.find((i) => i.productoId === prodId);
        if (item) {
          return {
            ...prev,
            [prodId]: {
              cantidad: item.cantidadSugerida,
              fechaExpiracion: item.fechaExpiracion
                ? dayjs(item.fechaExpiracion).toDate()
                : null,
            },
          };
        }
        return prev;
      }
    });
  };

  // Actualizar cantidad
  const updateQty = (prodId: number, qty: number) => {
    if (qty < 1) return; // No permitir cantidades menores a 1
    setSelected((prev) => ({
      ...prev,
      [prodId]: { ...prev[prodId], cantidad: qty },
    }));
  };

  // Actualizar fecha de expiración
  const updateDate = (prodId: number, dateString: string) => {
    const date = dateString
      ? dayjs(dateString).tz("America/Guatemala").startOf("day").toDate()
      : null;
    setSelected((prev) => ({
      ...prev,
      [prodId]: { ...prev[prodId], fechaExpiracion: date },
    }));
  };

  // Guardar cambios
  const handleSave = useCallback(async () => {
    if (submitting || Object.keys(selected).length === 0) return;
    const dto: UpdateRequisitionDto = {
      requisicionId: requisicionIdNum,
      sucursalId,
      usuarioId,
      lineas: Object.entries(selected).map(([id, data]) => ({
        productoId: Number(id),
        cantidadSugerida: data.cantidad,
        fechaExpiracion: data.fechaExpiracion
          ? data.fechaExpiracion.toISOString()
          : null, // Convert Date to ISO string
      })),
    };
    const MIN_DELAY = 600;
    const start = Date.now();
    setSubmitting(true);
    try {
      await updateRequisicion(dto);
      const elapsed = Date.now() - start;
      if (elapsed < MIN_DELAY) {
        await new Promise((r) => setTimeout(r, MIN_DELAY - elapsed));
      }
      toast.success("Requisición actualizada correctamente");
      setHasChanges(false);
      setOpenSaveDialog(false);
      navigate("/requisiciones");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar la requisición");
    } finally {
      setSubmitting(false);
    }
  }, [requisicionIdNum, sucursalId, usuarioId, selected, submitting, navigate]);

  // Cancelar cambios
  const handleCancel = () => {
    if (hasChanges) {
      setOpenCancelDialog(true);
    } else {
      navigate("/requisiciones");
    }
  };

  const confirmCancel = () => {
    // Restore initial state
    const initialSelected = Object.fromEntries(
      initialData.map((item) => [
        item.productoId,
        {
          cantidad: item.cantidadSugerida,
          fechaExpiracion: item.fechaExpiracion
            ? dayjs(item.fechaExpiracion).toDate()
            : null,
        },
      ])
    );
    setSelected(initialSelected);
    setHasChanges(false);
    setOpenCancelDialog(false);
    navigate("/requisiciones"); // Navigate after confirming cancel
  };
  console.log("El obj para update es: ", selected);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Edit3 className="h-5 w-5 text-blue-500" />
          <span>Editar Requisición #{requisicionIdNum}</span>
        </CardTitle>
        <div className="flex justify-between items-center">
          <CardDescription>
            Modifica las cantidades o desmarca productos que ya no necesites en
            esta requisición.
          </CardDescription>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={() => setOpenSaveDialog(true)}
              disabled={
                submitting || !hasChanges || Object.keys(selected).length === 0
              }
              aria-busy={submitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {hasChanges ? "Guardar cambios" : "Sin cambios"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">
              Cargando requisición...
            </h3>
            <p className="text-muted-foreground text-center">
              Obteniendo los datos de la requisición.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No hay productos en esta requisición
            </h3>
            <p className="text-muted-foreground text-center">
              Esta requisición no contiene productos para editar.
            </p>
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{items.length}</p>
                      <p className="text-xs text-muted-foreground">
                        Productos totales
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{selectedCount}</p>
                      <p className="text-xs text-muted-foreground">
                        Productos seleccionados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{totalSelectedQty}</p>
                      <p className="text-xs text-muted-foreground">
                        Unidades a solicitar
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {formattMoneda(totalSelectedCost)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Costo total estimado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Indicador de cambios */}
            {hasChanges && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Tienes cambios sin guardar en esta requisición
                  </span>
                </div>
              </div>
            )}
            {/* Tabla con scroll horizontal */}
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] p-2">
                      <span className="sr-only">Seleccionar</span>
                    </TableHead>
                    <TableHead className="min-w-[180px] p-2">
                      Producto
                    </TableHead>
                    <TableHead className="text-center min-w-[80px] p-2">
                      Stock Actual
                    </TableHead>
                    <TableHead className="text-center min-w-[80px] p-2">
                      Stock Mínimo
                    </TableHead>
                    <TableHead className="text-center min-w-[100px] p-2">
                      Cantidad
                    </TableHead>
                    <TableHead className="text-center min-w-[90px] p-2">
                      Precio
                    </TableHead>
                    <TableHead className="text-center min-w-[90px] p-2">
                      Total
                    </TableHead>
                    <TableHead className="text-center min-w-[120px] p-2">
                      F. Expiración
                    </TableHead>{" "}
                    {/* New column */}
                    <TableHead className="text-center min-w-[80px] p-2">
                      Alerta
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => {
                    const checked = item.productoId in selected;
                    const alertInfo = getAlertLevel(
                      item.stockActual,
                      item.stockMinimo
                    );
                    const currentQty = selected[item.productoId]?.cantidad || 0;
                    const hasQuantityChanged =
                      currentQty !== item.cantidadSugerida;
                    const currentExpDate =
                      selected[item.productoId]?.fechaExpiracion;
                    const initialExpDate = item.fechaExpiracion
                      ? dayjs(item.fechaExpiracion).toDate()
                      : null;
                    const hasDateChanged =
                      (currentExpDate &&
                        initialExpDate &&
                        !dayjs(currentExpDate).isSame(initialExpDate, "day")) ||
                      (!currentExpDate && initialExpDate) ||
                      (currentExpDate && !initialExpDate);

                    return (
                      <TableRow
                        key={item.productoId}
                        className={checked ? "bg-muted/50" : ""}
                      >
                        <TableCell className="p-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(item.productoId)}
                            aria-label={`Seleccionar ${item.nombre}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium p-2">
                          <div className="flex items-center space-x-2">
                            <Package className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate text-sm">
                              {item.nombre}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-1 py-0"
                          >
                            {item.stockActual}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs px-1 py-0"
                          >
                            {item.stockMinimo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center p-2">
                          {checked ? (
                            <div className="flex flex-col items-center space-y-1">
                              <Input
                                type="number"
                                min={1}
                                value={currentQty}
                                onChange={(e) =>
                                  updateQty(
                                    item.productoId,
                                    Number(e.target.value)
                                  )
                                }
                                className={`w-16 h-7 text-center text-xs ${
                                  hasQuantityChanged ? "border-rose-500" : ""
                                }`}
                                aria-label={`Cantidad para ${item.nombre}`}
                              />
                              {hasQuantityChanged && (
                                <span className="text-xs text-muted-foreground">
                                  Orig: {item.cantidadSugerida}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge
                              variant="default"
                              className="font-mono text-xs px-1 py-0"
                            >
                              {item.cantidadSugerida}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <span className="text-xs">
                            {item.precioCosto
                              ? formattMoneda(item.precioCosto)
                              : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <span className="text-xs font-medium">
                            {item.precioCosto
                              ? formattMoneda(item.precioCosto * currentQty)
                              : "N/A"}
                          </span>
                        </TableCell>
                        {/* New TableCell for Fecha Expiración */}
                        <TableCell className="text-center p-2">
                          {checked ? (
                            <Input
                              type="date"
                              className={`w-32 text-center text-xs p-1 ${
                                hasDateChanged ? "border-yellow-400 " : ""
                              }`}
                              value={
                                currentExpDate
                                  ? dayjs(currentExpDate).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(e) =>
                                updateDate(item.productoId, e.target.value)
                              }
                            />
                          ) : (
                            <span className="text-xs">
                              {item.fechaExpiracion
                                ? formatearFecha(item.fechaExpiracion)
                                : "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <Badge
                            variant={alertInfo.color as any}
                            className="text-xs px-1 py-0"
                          >
                            {alertInfo.level === "critical" && "Crítico"}
                            {alertInfo.level === "high" && "Alto"}
                            {alertInfo.level === "medium" && "Medio"}
                            {alertInfo.level === "low" && "Bajo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                          }
                        }}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                          }
                        }}
                        className={
                          currentPage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a{" "}
                    {Math.min(endIndex, items.length)} de {items.length}{" "}
                    productos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      {/* Dialog para confirmar guardado */}
      <AdvancedDialog
        title="¿Guardar cambios en la requisición?"
        description="Se actualizarán las cantidades y productos seleccionados en esta requisición."
        onOpenChange={setOpenSaveDialog}
        open={openSaveDialog}
        icon="alert"
        type="info"
        confirmButton={{
          label: "Sí, guardar cambios",
          disabled: submitting,
          loading: submitting,
          loadingText: "Guardando cambios...",
          onClick: handleSave,
        }}
        cancelButton={{
          label: "Cancelar",
          onClick: () => setOpenSaveDialog(false),
          disabled: submitting,
        }}
      />
      {/* Dialog para confirmar cancelación */}
      <AdvancedDialog
        title="¿Descartar cambios?"
        description="Se perderán todos los cambios realizados en esta requisición."
        onOpenChange={setOpenCancelDialog}
        open={openCancelDialog}
        icon="alert"
        type="warning"
        confirmButton={{
          label: "Sí, descartar cambios",
          onClick: confirmCancel, // Changed to confirmCancel
        }}
        cancelButton={{
          label: "Continuar editando",
          onClick: () => setOpenCancelDialog(false), // Changed to close dialog
        }}
      />
    </Card>
  );
};
