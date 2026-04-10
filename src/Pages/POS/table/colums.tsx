"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { ProductoData } from "../interfaces/newProductsPOSResponse";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Eye, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Meta que inyecta TablePOS a la tabla */
declare module "@tanstack/table-core" {
  interface TableMeta<TData extends unknown> {
    onAddToCart?: (p: ProductoData) => void;
    onPreviewImages?: (images: string[]) => void;
    getRemainingFor?: (p: ProductoData) => number;
  }
}

const columnHelper = createColumnHelper<ProductoData>();

const fmtQ = (v: string | number) => `Q${Number(v || 0).toFixed(2)}`;

export const columnsTablePos: ColumnDef<ProductoData, any>[] = [
  // ── Producto ──────────────────────────────────────────────────────────────
  columnHelper.accessor((row) => row.nombre, {
    id: "nombre",
    header: "Producto",
    sortingFn: "alphanumeric",

    cell: (info) => {
      const p = info.row.original;

      const urls = [
        ...(Array.isArray(p.images)
          ? (p.images.map((im) => im?.url).filter(Boolean) as string[])
          : []),
        ...((p as any).image ? [(p as any).image as string] : []),
      ];
      const first = urls[0];

      const openPreview = () => {
        if (urls.length > 0) info.table.options.meta?.onPreviewImages?.(urls);
      };

      return (
        <div className="flex items-center gap-2 min-w-0">
          {/* Thumbnail 32 × 32 */}
          <button
            type="button"
            onClick={openPreview}
            title={urls.length ? "Ver imágenes" : "Sin imagen"}
            className={cn(
              "relative shrink-0 w-8 h-8 rounded overflow-hidden border bg-muted/40",
              urls.length ? "cursor-pointer group" : "cursor-default",
            )}
          >
            {first ? (
              <>
                <img
                  src={first}
                  alt={p.nombre}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
            )}
          </button>

          {/* Nombre + código */}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium leading-tight truncate">
              {p.nombre}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono leading-tight truncate">
              {p.codigoProducto}
            </div>
          </div>
        </div>
      );
    },
  }),

  // ── Precios ───────────────────────────────────────────────────────────────
  columnHelper.display({
    id: "precios",
    header: "Precios",

    cell: (info) => {
      const precios = info.row.original.precios ?? [];
      if (!precios.length)
        return <span className="text-[10px] text-muted-foreground">—</span>;

      const MAX_INLINE = 4;
      const inline = precios.slice(0, MAX_INLINE);
      const rest = precios.slice(MAX_INLINE);

      return (
        <div className="flex items-start gap-1.5">
          <div className="flex flex-col gap-px">
            {inline.map((p) => (
              <span
                key={p.id}
                className="text-[10px] leading-tight whitespace-nowrap"
              >
                <span className="text-muted-foreground">{p.rol}:</span>{" "}
                <span className="font-medium tabular-nums">
                  {fmtQ(p.precio)}
                </span>
              </span>
            ))}
          </div>

          {rest.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  +{rest.length}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-3">
                <p className="text-xs font-semibold mb-2">Todos los precios</p>
                <div className="divide-y">
                  {precios.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-1 text-xs"
                    >
                      <span className="text-muted-foreground">{p.rol}</span>
                      <span className="font-medium tabular-nums">
                        {fmtQ(p.precio)}
                      </span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    },
  }),

  // ── Detalle / stock por sucursal ──────────────────────────────────────────
  columnHelper.display({
    id: "detalle",
    header: "",

    cell: (info) => {
      const p = info.row.original;
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Ver detalle"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 text-xs">
            <p className="font-semibold mb-2">Stock por sucursal</p>
            {Array.isArray(p.stocksBySucursal) &&
            p.stocksBySucursal.length > 0 ? (
              <div className="divide-y">
                {p.stocksBySucursal.map((s) => (
                  <div
                    key={`${s.sucursalId}-${s.nombre}`}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-muted-foreground truncate">
                      {s.nombre}
                    </span>
                    <span className="font-medium tabular-nums ml-2">
                      {s.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sin datos de stock</p>
            )}
            {p.descripcion && (
              <>
                <p className="font-semibold mt-3 mb-1">Descripción</p>
                <p className="text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {p.descripcion}
                </p>
              </>
            )}
          </PopoverContent>
        </Popover>
      );
    },
  }),

  // ── Stock total ────────────────────────────────────────────────────────────
  columnHelper.accessor(
    (row) => (row.stocks ?? []).reduce((acc, s) => acc + s.cantidad, 0),
    {
      id: "stockTotal",
      header: "Stock",
      sortingFn: "basic",

      cell: (info) => {
        const total = info.getValue<number>() ?? 0;
        const low = total <= 5;
        return (
          <span
            className={cn(
              "inline-block text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-sm",
              low
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-foreground",
            )}
          >
            {total}
          </span>
        );
      },
    },
  ),

  // ── Añadir al carrito ──────────────────────────────────────────────────────
  columnHelper.display({
    id: "accion",
    header: "",

    cell: (info) => {
      const p = info.row.original;
      const remaining =
        info.table.options.meta?.getRemainingFor?.(p) ??
        (p.stocks ?? []).reduce((acc, s) => acc + s.cantidad, 0);

      const disabled = remaining <= 0;

      return (
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => info.table.options.meta?.onAddToCart?.(p)}
          className="h-7 w-7 p-0 shrink-0"
          title={
            disabled ? "Sin stock" : `Agregar al carrito (disp. ${remaining})`
          }
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      );
    },
  }),
];
