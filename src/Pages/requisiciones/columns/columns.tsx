"use client";

import type { ColumnDef, RowData } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Package } from "lucide-react";
import {
  getEstadoBadgeVariant,
  RequisitionResponseDTO,
} from "@/Types/requisicion-interfaces/interfaces";
// Asegúrate de que esta ruta coincida con la ubicación de tu subcomponente
import { RequisitionRowActions } from "../components/requisiciones-row-actions";

// 1. Declaración global ÚNICA para todo el proyecto.
// Usamos TData para que cualquier tabla pueda aprovechar estas acciones opcionales sin chocar.
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onVerDetalle?: (row: TData) => void;
    onImprimir?: (row: TData) => void;
    onSendToCompras?: (row: TData) => void;
  }
}

// ============================================================
// Formatters
// ============================================================
const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatearMoneda = (n: number) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
    n,
  );

// ============================================================
// Column definitions (Diseño Vanilla, Compacto y Text-xs)
// ============================================================
export const requisicionColumns: ColumnDef<RequisitionResponseDTO, unknown>[] =
  [
    // ── Folio ──────────────────────────────────────────────────
    {
      accessorKey: "folio",
      header: () => <span className="text-xs font-medium">Folio</span>,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.folio}
        </span>
      ),
    },

    // ── Fecha ──────────────────────────────────────────────────
    {
      accessorKey: "fecha",
      header: () => (
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          Fecha
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatearFecha(row.original.fecha)}
        </span>
      ),
    },

    // ── Sucursal ───────────────────────────────────────────────
    {
      accessorKey: "sucursal.nombre",
      id: "sucursal",
      header: () => <span className="text-xs font-medium">Sucursal</span>,
      cell: ({ row }) => (
        <span className="text-xs">{row.original.sucursal.nombre}</span>
      ),
    },

    // ── Estado ─────────────────────────────────────────────────
    {
      accessorKey: "estado",
      header: () => <span className="text-xs font-medium">Estado</span>,
      cell: ({ row }) => (
        <Badge
          variant={getEstadoBadgeVariant(row.original.estado)}
          className="text-[10px] px-1.5 py-0 font-medium whitespace-nowrap"
        >
          {row.original.estado}
        </Badge>
      ),
    },

    // ── Total líneas ────────────────────────────────────────────
    {
      accessorKey: "totalLineas",
      header: () => (
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          Líneas
        </span>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {row.original.totalLineas}
        </Badge>
      ),
    },

    // ── Total ──────────────────────────────────────────────────
    {
      accessorKey: "totalRequisicion",
      header: () => (
        <span className="flex items-center gap-1.5 justify-end text-xs font-medium">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          Total
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-right block">
          {formatearMoneda(row.original.totalRequisicion)}
        </span>
      ),
    },

    // ── Acciones ───────────────────────────────────────────────
    {
      id: "acciones",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row, table }) => {
        // TypeScript ya infiere los tipos gracias al 'declare module' genérico
        const meta = table.options.meta;

        return (
          <div className="flex justify-end">
            <RequisitionRowActions
              requisicion={row.original}
              onVerDetalle={meta?.onVerDetalle ?? (() => {})}
              onImprimir={meta?.onImprimir ?? (() => {})}
              onSendToCompras={meta?.onSendToCompras ?? (() => {})}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
