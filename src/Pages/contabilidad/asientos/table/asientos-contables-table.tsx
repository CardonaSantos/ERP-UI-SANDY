// components/contabilidad/asientos-contables/asientos-contables-table.tsx
"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";
import { AsientoContable } from "@/Types/contabilidad/asientos-contables/asiento-contables";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAsientosColumns } from "./asientos-contables.columns";
import { EmptyState, LoadingRows } from "../../shared/badges";

interface AsientosTableProps {
  data: AsientoContable[];
  isLoading: boolean;
  pagination: PaginationState;
  // onPaginationChange: (pagination: PaginationState) => void;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageCount: number;
  onSelectAsiento: (asiento: AsientoContable) => void;
}

export function AsientosContablesTable({
  data,
  isLoading,
  pagination,
  onPaginationChange,
  pageCount,
  onSelectAsiento,
}: AsientosTableProps) {
  const columns = createAsientosColumns(onSelectAsiento);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination,
    },
    pageCount,
    onPaginationChange: onPaginationChange,
  });

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left font-medium text-muted-foreground"
                    style={{
                      width:
                        header.getSize() === 150 ? undefined : header.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <LoadingRows cols={8} />
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState message="No hay asientos contables registrados." />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 text-foreground"
                      style={{
                        width:
                          cell.column.getSize() === 150
                            ? undefined
                            : cell.column.getSize(),
                      }}
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

      {/* Summary + Pagination */}
      {!isLoading && table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Totales */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Total debe:{" "}
              <strong className="text-foreground">
                {fmt(data.reduce((s, a) => s + a.totalDebe, 0))}
              </strong>
            </span>
            <span>
              Total haber:{" "}
              <strong className="text-foreground">
                {fmt(data.reduce((s, a) => s + a.totalHaber, 0))}
              </strong>
            </span>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                title="Primera página"
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Página anterior"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Próxima página"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                title="Última página"
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n);
