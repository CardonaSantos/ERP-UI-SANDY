"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Loader2,
  Package,
  Hash,
  Barcode,
  Layers3,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import {
  getEstadoBadgeVariant,
  RequisitionLineDTO,
  RequisitionResponseDTO,
  SendToComprasDTO,
} from "@/Types/requisicion-interfaces/interfaces";
import {
  PartidaPresupuestal,
  ProveedorOption,
  SendToPurchasesDialog,
} from "./send-to-purchase";
import { requisicionColumns } from "../columns/columns";

// ============================================================
// Formatters (stubs — reemplazar con los reales de tu proyecto)
// ============================================================
const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatearMoneda = (n: number) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
    n,
  );

// ============================================================
// Sub-component: InfoRow
// ============================================================

function InfoRow({
  label,
  children,
  bold = false,
}: {
  label: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold" : "font-medium"}>{children}</span>
    </div>
  );
}

// ============================================================
// Props
// ============================================================

interface RequisitionsTableProps {
  // ── Data ────────────────────────────────────────────────────
  data: RequisitionResponseDTO[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRefetch: () => void;

  // ── Dialog dependencies ─────────────────────────────────────
  proveedores: ProveedorOption[];
  partidas: PartidaPresupuestal[];

  // ── Mutations (manejadas en el nivel superior) ───────────────
  isSendingToCompras: boolean;
  isDeletingRequisicion: boolean;
  onSendToCompras: (
    dto: SendToComprasDTO & { partidaPresupuestalId: string },
  ) => void;
  onDeleteRequisicion: (id: number) => void;
}

// ============================================================
// Component
// ============================================================

export function RequisitionsTable({
  data,
  isLoading,
  isError,
  error,
  onRefetch,
  proveedores,
  partidas,
  isSendingToCompras,
  isDeletingRequisicion,
  onSendToCompras,
  onDeleteRequisicion,
}: RequisitionsTableProps) {
  // ── Dialog state ────────────────────────────────────────────
  const [detailReq, setDetailReq] = useState<RequisitionResponseDTO | null>(
    null,
  );
  const [sendReq, setSendReq] = useState<RequisitionResponseDTO | null>(null);
  const [deleteReq, setDeleteReq] = useState<RequisitionResponseDTO | null>(
    null,
  );

  // ── Meta callbacks para columnas ────────────────────────────
  const columnMeta: Record<string, (req: RequisitionResponseDTO) => void> = {
    onVerDetalle: (req: RequisitionResponseDTO) => setDetailReq(req),
    onImprimir: (req: RequisitionResponseDTO) => {
      // Al envolverlo en llaves, la función retorna void en lugar de Window
      window.open(`/pdf-requisicion/${req.id}`, "_blank");
    },
    onSendToCompras: (req: RequisitionResponseDTO) => setSendReq(req),
    onDelete: (req: RequisitionResponseDTO) => setDeleteReq(req),
  };
  // ── TanStack Table ──────────────────────────────────────────
  const table = useReactTable({
    data,
    columns: requisicionColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    meta: columnMeta,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalItems = data.length;
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  // ── Handlers que delegan al padre ───────────────────────────
  const handleConfirmDelete = () => {
    if (!deleteReq) return;
    onDeleteRequisicion(deleteReq.id);
    setDeleteReq(null);
  };

  // ── Loading / Error / Empty guards ──────────────────────────
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">
            Cargando requisiciones...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Error al cargar requisiciones
          </CardTitle>
          <CardDescription className="text-destructive text-xs">
            {(error as { message?: string })?.message ?? "Error desconocido"}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm" variant="outline" onClick={onRefetch}>
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No hay requisiciones</p>
          <p className="text-xs text-muted-foreground">
            No se encontraron registros en el sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Render principal ────────────────────────────────────────
  return (
    <>
      <Card>
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Requisiciones
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Total: {data.length} registros
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onRefetch}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refrescar
          </Button>
        </CardHeader>

        {/* Tabla */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="hover:bg-transparent">
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-xs h-8 px-3 font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="h-9">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-1.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Paginación */}
        {table.getPageCount() > 1 && (
          <CardFooter className="flex items-center justify-between px-4 py-2 border-t gap-4">
            <p className="text-xs text-muted-foreground">
              {startItem}–{endItem} de {totalItems}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground px-1">
                Pág. {pageIndex + 1} / {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* ── Dialog: Ver Detalle ─────────────────────────────── */}
      <Dialog open={!!detailReq} onOpenChange={(v) => !v && setDetailReq(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Requisición{detailReq?.folio ? ` — ${detailReq.folio}` : ""}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Información completa de la requisición y sus líneas
            </DialogDescription>
          </DialogHeader>

          {detailReq && (
            <ScrollArea className="max-h-[68vh] pr-1">
              <div className="space-y-4">
                {/* Info general + adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="shadow-none">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Información general
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      <InfoRow label="Folio:">{detailReq.folio}</InfoRow>
                      <InfoRow label="Fecha:">
                        {formatearFecha(detailReq.fecha)}
                      </InfoRow>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Estado:</span>
                        <Badge
                          variant={getEstadoBadgeVariant(detailReq.estado)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {detailReq.estado}
                        </Badge>
                      </div>
                      <InfoRow label="Total líneas:">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {detailReq.totalLineas}
                        </Badge>
                      </InfoRow>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Detalles adicionales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      <InfoRow label="Sucursal:">
                        {detailReq.sucursal.nombre}
                      </InfoRow>
                      <InfoRow label="Usuario:">
                        {detailReq.usuario.nombre}
                      </InfoRow>
                      <InfoRow label="Rol:">{detailReq.usuario.rol}</InfoRow>
                      <InfoRow label="Total:" bold>
                        {formatearMoneda(detailReq.totalRequisicion)}
                      </InfoRow>
                    </CardContent>
                  </Card>
                </div>

                {/* Observaciones */}
                {detailReq.observaciones && (
                  <Card className="shadow-none">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Observaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <p className="text-xs text-muted-foreground">
                        {detailReq.observaciones}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Líneas */}
                <div>
                  <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-3">
                    <Package className="h-3.5 w-3.5" />
                    Líneas de productos ({detailReq.lineas.length})
                  </h3>

                  <div className="space-y-2">
                    {detailReq.lineas.map((l: RequisitionLineDTO) => (
                      <Card
                        key={l.id}
                        className="shadow-none border-l-2 border-l-border"
                      >
                        <CardContent className="px-3 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Identidad */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium">
                                  {l.producto.nombre}
                                </span>
                                {l.esPresentacion && (
                                  <Badge
                                    variant="default"
                                    className="text-[9px] px-1 py-0"
                                  >
                                    <Layers3 className="h-2.5 w-2.5 mr-0.5" />
                                    Pres.
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {l.producto.codigoProducto}
                              </p>
                              {l.esPresentacion && l.presentacion && (
                                <div className="text-[11px] text-muted-foreground space-y-0.5">
                                  <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {l.presentacion.nombre} (×
                                    {l.presentacion.factorUnidadBase})
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Barcode className="h-3 w-3" />
                                    SKU: {l.presentacion.sku ?? "—"}
                                  </div>
                                </div>
                              )}
                              {l.fechaExpiracion && (
                                <p className="text-[11px] text-muted-foreground">
                                  Vence: {formatearFecha(l.fechaExpiracion)}
                                </p>
                              )}
                            </div>

                            {/* Cantidades */}
                            <div className="space-y-1.5">
                              <InfoRow label="Stock actual:">
                                {l.cantidadActual}
                              </InfoRow>
                              <InfoRow label="Stock mínimo:">
                                {l.stockMinimo}
                              </InfoRow>
                              <InfoRow label="Cant. sugerida:">
                                <span className="text-primary font-semibold">
                                  {l.cantidadSugerida}
                                </span>
                              </InfoRow>
                            </div>

                            {/* Precios */}
                            <div className="space-y-1.5">
                              <InfoRow label="Precio unitario:">
                                {formatearMoneda(l.precioUnitario)}
                              </InfoRow>
                              <InfoRow label="Subtotal:" bold>
                                {formatearMoneda(l.subtotal)}
                              </InfoRow>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Auditoría */}
                <Card className="shadow-none">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Auditoría
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 grid grid-cols-2 gap-2">
                    <InfoRow label="Creado:">
                      {formatearFecha(detailReq.createdAt)}
                    </InfoRow>
                    <InfoRow label="Actualizado:">
                      {formatearFecha(detailReq.updatedAt)}
                    </InfoRow>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Confirmar eliminar ──────────────────────── */}
      <Dialog open={!!deleteReq} onOpenChange={(v) => !v && setDeleteReq(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-destructive" />
              Eliminar requisición
            </DialogTitle>
            <DialogDescription className="text-xs">
              Esta acción eliminará el registro{" "}
              <strong>{deleteReq?.folio}</strong> de forma permanente y no podrá
              revertirse.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteReq(null)}
              disabled={isDeletingRequisicion}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeletingRequisicion}
              onClick={handleConfirmDelete}
            >
              {isDeletingRequisicion ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Enviar a compras ────────────────────────── */}
      <SendToPurchasesDialog
        open={!!sendReq}
        onOpenChange={(v) => !v && setSendReq(null)}
        requisicion={sendReq}
        proveedores={proveedores}
        partidas={partidas}
        isPending={isSendingToCompras}
        onConfirm={(dto) => {
          onSendToCompras(dto);
          setSendReq(null);
        }}
      />
    </>
  );
}
