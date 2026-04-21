"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { MovimientoCajaItem } from "./Interfaces/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Hash,
  ExternalLink,
} from "lucide-react";
import {
  getTipoStyles,
  getTipoIcon,
  getCategoriaStyles,
} from "./utils/movimiento-styles";
import { Link } from "react-router-dom";

const ch = createColumnHelper<MovimientoCajaItem>();

// Función helper para formatear fechas
const formatDate = (fecha: string) => {
  const date = new Date(fecha);
  const fechaStr = date.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const horaStr = date.toLocaleTimeString("es-GT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { fecha: fechaStr, hora: horaStr };
};

// Función helper para formatear moneda
const formatMoneda = (monto: number) => {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(monto);
};

// Función helper para truncar texto
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const columnasMovimientos: ColumnDef<MovimientoCajaItem, any>[] = [
  ch.accessor("id", {
    header: () => (
      <div className="flex items-center gap-1">
        <Hash className="h-3 w-3" />
        <span className="font-medium text-xs">ID</span>
      </div>
    ),
    cell: (info) => (
      <div className="font-mono text-xs font-medium">#{info.getValue()}</div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 50,
  }),

  ch.accessor("tipo", {
    header: () => (
      <div className="flex items-center gap-1">
        <span className="font-medium text-xs">Tipo</span>
      </div>
    ),
    cell: (info) => (
      <div className="flex items-center gap-1">
        <Badge
          className={`${getTipoStyles(info.getValue())} text-xs px-1.5 py-0.5`}
        >
          <span className="mr-1">{getTipoIcon(info.getValue())}</span>
          {info.getValue()}
        </Badge>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 110,
  }),

  ch.accessor("fecha", {
    header: () => (
      <div className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        <span className="font-medium text-xs">Fecha</span>
      </div>
    ),
    cell: (info) => {
      const { fecha, hora } = formatDate(info.getValue());
      return (
        <div className="text-xs">
          <div className="font-medium">{fecha}</div>
          <div className="text-xs text-muted-foreground">{hora}</div>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    size: 85,
  }),

  ch.accessor("monto", {
    header: () => (
      <div className="flex items-center gap-1">
        <DollarSign className="h-3 w-3" />
        <span className="font-medium text-xs">Monto</span>
      </div>
    ),
    cell: (info) => {
      const tipo = info.row.original.tipo;
      const isIngreso = tipo === "INGRESO" || tipo === "VENTA";
      return (
        <div
          className={`font-mono text-xs font-semibold ${
            isIngreso
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatMoneda(info.getValue())}
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    size: 90,
  }),

  ch.accessor("usuario.nombre", {
    header: () => (
      <div className="flex items-center gap-1">
        <User className="h-3 w-3" />
        <span className="font-medium text-xs">Usuario</span>
      </div>
    ),
    cell: (info) => (
      <div className="flex items-center gap-1.5">
        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-2.5 w-2.5 text-primary dark:text-white" />
        </div>
        <span className="font-medium text-xs">
          {truncateText(info.getValue() || "Sin usuario", 12)}
        </span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 120,
  }),

  ch.accessor("categoria", {
    header: () => (
      <div className="flex items-center gap-1">
        <span className="font-medium text-xs">Categoría</span>
      </div>
    ),
    cell: (info) => {
      const categoria = info.getValue();
      return categoria ? (
        <Badge
          className={`${getCategoriaStyles(categoria)} text-xs px-1.5 py-0.5`}
        >
          {categoria.replace(/_/g, " ")}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    size: 120,
  }),

  ch.accessor("descripcion", {
    header: () => (
      <div className="flex items-center gap-1">
        <FileText className="h-3 w-3" />
        <span className="font-medium text-xs">Descripción</span>
      </div>
    ),
    cell: (info) => (
      <div className="text-xs">
        {info.getValue() ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  {truncateText(info.getValue(), 25)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{info.getValue()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 150,
  }),

  ch.accessor("caja.id", {
    header: () => (
      <div className="flex items-center gap-1">
        <Building2 className="h-3 w-3" />
        <span className="font-medium text-xs">Caja</span>
      </div>
    ),
    cell: (info) => {
      const caja = info.row.original.caja;
      return caja ? (
        <div className="text-xs">
          <div className="font-medium">#{caja.id}</div>
          <div className="text-xs text-muted-foreground">
            {caja.sucursal.nombre}
          </div>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    size: 80,
  }),

  ch.display({
    id: "acciones",
    header: () => (
      <span className="font-medium text-xs flex justify-center">Acciones</span>
    ),
    cell: (info) => {
      const movimiento = info.row.original;

      return (
        <div className="flex items-center justify-center gap-1 w-full">
          <Link to={`/movimiento-caja/${movimiento.id}`}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
    size: 90,
  }),
];
