"use client";
import React from "react";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Package,
  Search,
  X,
} from "lucide-react";
import { CompraListItem } from "@/Types/compras/interfaces";
import { comprasColumns } from "./columns";
import { ComprasDetailDialog } from "./compras-detail-dialog";

type ComprasTableProps = {
  data: CompraListItem[];
  page: number;
  limit: number;
  pages: number;
  total: number;
  loading?: boolean;
  onChangePage: (p: number) => void;
  onChangeLimit: (l: number) => void;
  onOpenDetalle?: (compra: CompraListItem) => void;
};

function LoadingBar() {
  return (
    <div className="h-px w-full overflow-hidden bg-border">
      <div className="h-px animate-[shimmer_1.2s_ease-in-out_infinite] bg-primary/50 w-1/3" />
    </div>
  );
}

function SortIndicator({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return <span className="text-primary text-[10px] leading-none">↑</span>;
  if (sorted === "desc")
    return <span className="text-primary text-[10px] leading-none">↓</span>;
  return (
    <span className="text-muted-foreground/40 text-[10px] leading-none">↕</span>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
      <Package className="h-8 w-8 opacity-30" />
      <p className="text-sm font-medium">Sin resultados</p>
      <p className="text-xs">
        {hasFilters
          ? "Intenta ajustar los filtros activos"
          : "No hay compras registradas"}
      </p>
    </div>
  );
}

function Pagination({
  page,
  pages,
  limit,
  total,
  loading,
  onChangePage,
  onChangeLimit,
}: {
  page: number;
  pages: number;
  limit: number;
  total: number;
  loading?: boolean;
  onChangePage: (p: number) => void;
  onChangeLimit: (l: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Ventana de páginas numeradas
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  let startPage = Math.max(1, page - halfWindow);
  const endPage = Math.min(pages, startPage + windowSize - 1);
  if (endPage - startPage < windowSize - 1) {
    startPage = Math.max(1, endPage - windowSize + 1);
  }
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2 border-t text-xs text-muted-foreground">
      {/* Rango + selector */}
      <div className="flex items-center gap-2">
        <span>
          {from}–{to} de {total}
        </span>
        <select
          className="h-6 rounded border border-input bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          value={limit}
          onChange={(e) => onChangeLimit(Number(e.target.value))}
          disabled={loading}
          aria-label="Registros por página"
        >
          {[5, 10, 15, 25, 50].map((s) => (
            <option key={s} value={s}>
              {s} / pág.
            </option>
          ))}
        </select>
      </div>

      {/* Botones de navegación */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onChangePage(1)}
          disabled={page <= 1 || loading}
          aria-label="Primera página"
        >
          <ChevronsLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onChangePage(page - 1)}
          disabled={page <= 1 || loading}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {startPage > 1 && (
          <span className="px-1 text-muted-foreground/50">…</span>
        )}

        {pageNumbers.map((n) => (
          <Button
            key={n}
            variant={n === page ? "default" : "ghost"}
            size="icon"
            className="h-6 w-6 text-xs"
            onClick={() => onChangePage(n)}
            disabled={loading}
            aria-label={`Página ${n}`}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </Button>
        ))}

        {endPage < pages && (
          <span className="px-1 text-muted-foreground/50">…</span>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onChangePage(page + 1)}
          disabled={page >= pages || loading}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onChangePage(pages)}
          disabled={page >= pages || loading}
          aria-label="Última página"
        >
          <ChevronsRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function ComprasTable({
  data,
  page,
  limit,
  pages,
  total,
  loading,
  onChangePage,
  onChangeLimit,
}: ComprasTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [selected, setSelected] = React.useState<CompraListItem | null>(null);
  const [openDetalle, setOpenDetalle] = React.useState(false);
  const tableData = React.useMemo(() => data, [data]);

  const table = useReactTable<CompraListItem>({
    data: tableData,
    columns: comprasColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: Math.max(0, page - 1),
        pageSize: limit,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: Math.max(0, page - 1), pageSize: limit })
          : updater;
      if (next.pageSize !== limit) onChangeLimit(next.pageSize);
      if (next.pageIndex !== Math.max(0, page - 1))
        onChangePage(next.pageIndex + 1);
    },
    manualPagination: true,
    pageCount: pages,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onOpenDetalle: (row: CompraListItem) => {
        setSelected(row);
        setOpenDetalle(true);
      },
    },
  });

  const activeFiltersCount = columnFilters.length + (globalFilter ? 1 : 0);
  const hasFilters = activeFiltersCount > 0;

  const clearFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar compras..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-7 h-7 text-xs"
            aria-label="Buscar compras"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
          >
            <Filter className="h-3 w-3" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground gap-1"
              onClick={clearFilters}
              aria-label="Limpiar filtros"
            >
              <X className="h-3 w-3" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div
        className="rounded-md border overflow-hidden"
        aria-busy={!!loading}
        aria-label="Tabla de compras"
      >
        {loading && <LoadingBar />}

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/40">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-2 py-2 text-left font-medium"
                      style={{ width: header.getSize() }}
                    >
                      <div
                        className="flex items-center gap-1 cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <SortIndicator sorted={header.column.getIsSorted()} />
                        )}
                      </div>

                      {/* Filtros por columna (visibles con toggle) */}
                      {showFilters && header.column.getCanFilter() && (
                        <div
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            value={
                              (header.column.getFilterValue() as string) ?? ""
                            }
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            placeholder="Filtrar…"
                            className="h-6 text-xs"
                          />
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={comprasColumns.length} className="text-center">
                    <EmptyState hasFilters={hasFilters} />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-2 py-1.5"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación integrada al borde inferior de la tabla */}
        {total > 0 && (
          <Pagination
            page={page}
            pages={pages}
            limit={limit}
            total={total}
            loading={loading}
            onChangePage={onChangePage}
            onChangeLimit={onChangeLimit}
          />
        )}
      </div>
      <ComprasDetailDialog
        open={openDetalle}
        onOpenChange={setOpenDetalle}
        compra={selected}
      />
    </div>
  );
}
