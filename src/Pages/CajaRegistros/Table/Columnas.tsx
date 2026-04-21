import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { RegistroCajaResponse } from "../interfaces/registroscajas.interfaces";
import { formattFechaWithMinutes } from "@/Pages/Utils/Utils";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { Button } from "@/components/ui/button";
import { User, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { getEstadoStyles, getEstadoIcon } from "../utils/estadoStyles";
import { truncateText } from "../utils/textUtils";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onToggleCaja?: (id: number) => void;
    cajasIds?: number[];
    onOpenDetalle?: (row: TData) => void;
  }
}

const ch = createColumnHelper<RegistroCajaResponse>();

export const columnas: ColumnDef<RegistroCajaResponse, any>[] = [
  ch.display({
    id: "select",
    header: () => (
      <div className="flex justify-center">
        <span className="font-medium text-xs">Sel</span>
      </div>
    ),
    cell: (info) => {
      const caja = info.row.original;

      const { onToggleCaja, cajasIds } = info.table.options.meta!;

      if (!onToggleCaja || !cajasIds) return null;

      const isSelected = cajasIds.includes(caja.id);

      return (
        <div className="flex justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleCaja(caja.id)}
          />
        </div>
      );
    },
    size: 40,
    minSize: 40,
    maxSize: 40,
  }),

  ch.accessor("id", {
    header: () => (
      <div className="flex items-center gap-1">
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

  ch.accessor("usuarioInicio.nombre", {
    header: () => (
      <div className="flex items-center gap-1">
        <User className="h-3 w-3 " />
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

  ch.accessor("fechaApertura", {
    header: () => (
      <div className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        <span className="font-medium text-xs">F. Inicio</span>
      </div>
    ),
    cell: (info) => (
      <div className="text-xs">
        {info.getValue() ? (
          <div className="space-y-0.5">
            <div className="font-medium">
              {formattFechaWithMinutes(info.getValue<string>()).split(" ")[0]}
            </div>
            <div className="text-xs text-muted-foreground">
              {formattFechaWithMinutes(info.getValue<string>()).split(" ")[1]}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 85,
  }),

  ch.accessor("saldoInicial", {
    header: () => (
      <div className="flex items-center gap-1">
        <DollarSign className="h-3 w-3" />
        <span className="font-medium text-xs">S. Inicial</span>
      </div>
    ),
    cell: (info) => (
      <div className="font-mono text-xs font-semibold text-green-600 dark:text-green-400">
        {info.getValue() ? formattMonedaGT(info.getValue()) : "—"}
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 90,
  }),

  ch.accessor("fechaCierre", {
    header: () => (
      <div className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        <span className="font-medium text-xs">F. Cierre</span>
      </div>
    ),
    cell: (info) => (
      <div className="text-xs">
        {info.getValue() ? (
          <div className="space-y-0.5">
            <div className="font-medium">
              {formattFechaWithMinutes(info.getValue<string>()).split(" ")[0]}
            </div>
            <div className="text-xs text-muted-foreground">
              {formattFechaWithMinutes(info.getValue<string>()).split(" ")[1]}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-xs">
            Pendiente
          </span>
        )}
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 85,
  }),

  ch.accessor("saldoFinal", {
    header: () => (
      <div className="flex items-center gap-1">
        <DollarSign className="h-3 w-3" />
        <span className="font-medium text-xs">S. Final</span>
      </div>
    ),
    cell: (info) => (
      <div className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue() ? formattMonedaGT(info.getValue()) : "—"}
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 90,
  }),

  ch.accessor("movimientosLenght", {
    header: () => <span className="font-medium text-xs">Mov.</span>,
    cell: (info) => (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
          {info.getValue()}
        </span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 60,
  }),

  ch.accessor("ventasLenght", {
    header: () => <span className="font-medium text-xs">Ventas</span>,
    cell: (info) => (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400">
          {info.getValue()}
        </span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 60,
  }),

  ch.accessor("estado", {
    header: () => <span className="font-medium text-xs">Estado</span>,
    cell: (info) => (
      <div className="flex items-center gap-1">
        <span className="text-xs">{getEstadoIcon(info.getValue())}</span>
        <span className={`${getEstadoStyles(info.getValue())} text-xs`}>
          {info.getValue()}
        </span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    size: 90,
  }),
  ch.display({
    id: "acciones",
    header: () => (
      <span className="font-medium text-xs flex justify-center">Acciones</span>
    ),
    cell: (info) => {
      const caja = info.row.original;

      return (
        <div className="flex items-center justify-center w-full">
          <Link to={`/caja/${caja.id}`}>
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
