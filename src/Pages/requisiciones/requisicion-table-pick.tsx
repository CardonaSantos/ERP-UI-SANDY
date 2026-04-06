"use client";

import React from "react";
import {
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  RefreshCw,
  PackageSearch,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  keyForPresentacion,
  keyForProducto,
  PagedResponse,
  RequisitionProductCandidate,
  SelectedKey,
  SelectedLine,
} from "@/Types/requisiciones/requisiciones-tables";
import {
  buildCandidateColumns,
  computePresentacionCostoUnitario,
  DateInput,
  normalizeDecimal,
  PendingFoliosBadge,
  PriceInput,
  QtyInput,
  toFixed2,
} from "./columns/columns-requisicion-table";

// ─── types ────────────────────────────────────────────────────────────────────

type Props = {
  data: PagedResponse<RequisitionProductCandidate> | undefined;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  q: string;
  onSearchChange: (q: string) => void;
  refetch: () => void;
  selected: Record<SelectedKey, SelectedLine>;
  setSelected: React.Dispatch<
    React.SetStateAction<Record<SelectedKey, SelectedLine>>
  >;
  onAfterSelectionChange?: () => void;
};

// ─── main component ───────────────────────────────────────────────────────────

export default function RequisitionCandidatesTable(props: Props) {
  const {
    data,
    isLoading,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    q,
    onSearchChange,
    refetch,
    selected,
    setSelected,
    onAfterSelectionChange,
  } = props;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // ── selection handlers ──────────────────────────────────────────────────────

  const toggleProducto = (row: RequisitionProductCandidate) => {
    const k = keyForProducto(row.productoId);
    setSelected((prev) => {
      const next = { ...prev };
      if (next[k]) {
        delete next[k];
      } else {
        next[k] = {
          scope: "PRODUCTO",
          productoId: row.productoId,
          cantidad: Math.max(1, row.faltanteSugerido || 1),
          fechaExpiracion: null,
          precioCostoUnitario: toFixed2(row.precioCostoProducto ?? 0),
          actualizarCosto: false,
        };
      }
      onAfterSelectionChange?.();
      return next;
    });
  };

  const togglePresentacion = (
    row: RequisitionProductCandidate,
    presentacionId: number,
  ) => {
    const k = keyForPresentacion(presentacionId);
    const pres = row.presentaciones.find((x) => x.id === presentacionId)!;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[k]) {
        delete next[k];
      } else {
        const precio = computePresentacionCostoUnitario(
          pres.costoReferencialPresentacion,
          row.precioCostoProducto,
          pres.factorUnidadBase,
        );
        next[k] = {
          scope: "PRESENTACION",
          productoId: row.productoId,
          presentacionId,
          cantidad: 1,
          fechaExpiracion: null,
          precioCostoUnitario: precio,
          actualizarCosto: false,
        };
      }
      onAfterSelectionChange?.();
      return next;
    });
  };

  const updateQty = (k: SelectedKey, qty: number) =>
    setSelected((prev) => ({
      ...prev,
      [k]: { ...prev[k], cantidad: Math.max(1, qty | 0) },
    }));

  const updateDate = (k: SelectedKey, val: string) =>
    setSelected((prev) => ({
      ...prev,
      [k]: { ...prev[k], fechaExpiracion: val },
    }));

  const updatePrecio = (k: SelectedKey, v: string) =>
    setSelected((prev) => ({
      ...prev,
      [k]: { ...prev[k], precioCostoUnitario: normalizeDecimal(v) },
    }));

  const toggleActualizarCosto = (k: SelectedKey, checked: boolean) =>
    setSelected((prev) => ({
      ...prev,
      [k]: { ...prev[k], actualizarCosto: checked },
    }));

  // ── columns ────────────────────────────────────────────────────────────────

  const columns = React.useMemo(
    () =>
      buildCandidateColumns({
        selected,
        toggleProducto,
        updateQty,
        updateDate,
        updatePrecio,
        toggleActualizarCosto,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected],
  );

  // ── table ──────────────────────────────────────────────────────────────────

  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data: items,
    columns,
    state: { pagination, sorting, expanded },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.presentaciones.length > 0,
    onPaginationChange,
    onSortingChange,
    onExpandedChange: setExpanded,
    pageCount: totalPages,
  });

  // ── pagination helpers ─────────────────────────────────────────────────────

  const canPrev = pagination.pageIndex > 0;
  const canNext = pagination.pageIndex + 1 < totalPages;
  const goTo = (idx: number) =>
    onPaginationChange((old) => ({ ...old, pageIndex: idx }));

  const pageWindow = React.useMemo(() => {
    const range: number[] = [];
    const delta = 1;
    const left = Math.max(0, pagination.pageIndex - delta);
    const right = Math.min(totalPages - 1, pagination.pageIndex + delta);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  }, [pagination.pageIndex, totalPages]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por código o nombre…"
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="h-8 gap-1.5 text-xs"
          aria-label="Refrescar tabla"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refrescar
        </Button>

        {/* counter badge */}
        {Object.keys(selected).length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground border rounded-full px-2.5 py-0.5 self-center">
            <span className="font-medium text-foreground">
              {Object.keys(selected).length}
            </span>
            seleccionados
          </span>
        )}
      </div>

      {/* Table wrapper — horizontal scroll on small screens */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[640px] text-xs">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="h-8 px-2 py-0 bg-muted/40 first:pl-3"
                    style={{
                      width: h.getSize() ? `${h.getSize()}px` : undefined,
                    }}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando productos…
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <PackageSearch className="w-6 h-6 opacity-40" />
                    Sin resultados
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const prodKey = keyForProducto(row.original.productoId);
                const prodSelected = !!selected[prodKey];

                return (
                  <React.Fragment key={row.id}>
                    {/* Fila principal */}
                    <TableRow
                      data-state={row.getIsExpanded() ? "expanded" : undefined}
                      className={
                        prodSelected
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : "border-l-2 border-l-transparent"
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-1.5 px-2 align-middle first:pl-3"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Fila expandida — presentaciones */}
                    {row.getIsExpanded() && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={columns.length}
                          className="p-0 border-t border-dashed"
                        >
                          <PresentacionesSubTable
                            row={row.original}
                            selected={selected}
                            togglePresentacion={togglePresentacion}
                            updateQty={updateQty}
                            updateDate={updateDate}
                            updatePrecio={updatePrecio}
                            toggleActualizarCosto={toggleActualizarCosto}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {total > 0
            ? `${pagination.pageIndex * pagination.pageSize + 1}–${Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                total,
              )} de ${total} productos`
            : "Sin productos"}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!canPrev}
            onClick={() => goTo(0)}
            aria-label="Primera página"
          >
            <ChevronFirst className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!canPrev}
            onClick={() => goTo(pagination.pageIndex - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          {pageWindow.map((idx) => (
            <Button
              key={idx}
              variant={idx === pagination.pageIndex ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 text-xs"
              onClick={() => goTo(idx)}
              aria-label={`Ir a página ${idx + 1}`}
              aria-current={idx === pagination.pageIndex ? "page" : undefined}
            >
              {idx + 1}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!canNext}
            onClick={() => goTo(pagination.pageIndex + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!canNext}
            onClick={() => goTo(totalPages - 1)}
            aria-label="Última página"
          >
            <ChevronLast className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── presentaciones sub-table ─────────────────────────────────────────────────

type PresentacionesSubTableProps = {
  row: RequisitionProductCandidate;
  selected: Record<SelectedKey, SelectedLine>;
  togglePresentacion: (
    row: RequisitionProductCandidate,
    presentacionId: number,
  ) => void;
  updateQty: (k: SelectedKey, qty: number) => void;
  updateDate: (k: SelectedKey, val: string) => void;
  updatePrecio: (k: SelectedKey, v: string) => void;
  toggleActualizarCosto: (k: SelectedKey, checked: boolean) => void;
};

function PresentacionesSubTable({
  row,
  selected,
  togglePresentacion,
  updateQty,
  updateDate,
  updatePrecio,
  toggleActualizarCosto,
}: PresentacionesSubTableProps) {
  return (
    <div className="bg-muted/20 px-3 py-2 space-y-1">
      {/* header row */}
      <div className="grid grid-cols-[28px_1fr_72px_60px_80px_80px_124px_56px] gap-x-2 px-1 pb-1 border-b">
        {[
          "",
          "Presentación",
          "Costo ref.",
          "Cant.",
          "Precio u.",
          "Total",
          "F. exp.",
          "Costo",
        ].map((h, i) => (
          <span
            key={i}
            className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide"
          >
            {h}
          </span>
        ))}
      </div>

      {row.presentaciones.map((pp) => {
        const presKey = keyForPresentacion(pp.id);
        const presSel = selected[presKey];
        const costoSug = computePresentacionCostoUnitario(
          pp.costoReferencialPresentacion,
          row.precioCostoProducto,
          pp.factorUnidadBase,
        );
        const totalPres = presSel
          ? Number(presSel.precioCostoUnitario || "0") * (presSel.cantidad || 0)
          : null;

        return (
          <div
            key={pp.id}
            className={`grid grid-cols-[28px_1fr_72px_60px_80px_80px_124px_56px] gap-x-2 items-center px-1 py-1 rounded-sm transition-colors ${
              presSel ? "bg-primary/5" : "hover:bg-muted/40"
            }`}
          >
            {/* checkbox */}
            <Checkbox
              checked={!!presSel}
              onCheckedChange={() => togglePresentacion(row, pp.id)}
              aria-label="Seleccionar presentación"
            />

            {/* nombre + meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium truncate">
                  {pp.nombre}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 h-4 shrink-0 font-normal"
                >
                  {pp.tipoPresentacion}
                </Badge>
                <PendingFoliosBadge folios={pp.pendientesFolios} />
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                ×{pp.factorUnidadBase} · stk {pp.stockCantidadPresentacion} · eq{" "}
                {pp.stockEquivalenteBase}
              </div>
            </div>

            {/* costo sugerido */}
            <span className="text-[10px] font-mono text-muted-foreground">
              Q {toFixed2(costoSug)}
            </span>

            {/* cantidad */}
            {presSel ? (
              <QtyInput
                value={presSel.cantidad}
                onChange={(v) => updateQty(presKey, v)}
                ariaLabel="Cantidad presentación"
              />
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}

            {/* precio */}
            {presSel ? (
              <PriceInput
                value={presSel.precioCostoUnitario}
                onChange={(v) => updatePrecio(presKey, v)}
                ariaLabel="Precio costo presentación"
              />
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}

            {/* total */}
            <span className="text-xs font-mono tabular-nums">
              {totalPres !== null ? `Q ${toFixed2(totalPres)}` : "—"}
            </span>

            {/* fecha */}
            {presSel ? (
              <DateInput
                value={presSel.fechaExpiracion}
                onChange={(v) => updateDate(presKey, v)}
                ariaLabel="Fecha expiración presentación"
              />
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}

            {/* actualizar costo */}
            {presSel ? (
              <Checkbox
                checked={!!presSel.actualizarCosto}
                onCheckedChange={(v) => toggleActualizarCosto(presKey, !!v)}
                aria-label="Actualizar costo presentación"
                className="block mx-auto"
              />
            ) : (
              <span className="text-xs text-muted-foreground text-center block">
                —
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
