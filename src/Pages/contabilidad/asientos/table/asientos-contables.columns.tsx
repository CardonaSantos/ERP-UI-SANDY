"use client";
import { ColumnDef } from "@tanstack/react-table";
import { AsientoContable } from "@/Types/contabilidad/asientos-contables/asiento-contables";
import { ORIGENES_ASIENTO } from "@/Types/contabilidad/origen";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeEstadoAsiento } from "../../shared/badges";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n);

export const createAsientosColumns = (
  onSelectAsiento: (asiento: AsientoContable) => void,
): ColumnDef<AsientoContable>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground">
        #{row.getValue("id")}
      </span>
    ),
    size: 80,
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {new Date(row.getValue("fecha") as string).toLocaleDateString("es-PE")}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => (
      <span className="max-w-[180px] truncate block">
        {row.getValue("descripcion")}
      </span>
    ),
    size: 200,
  },
  {
    accessorKey: "origen",
    header: "Origen",
    cell: ({ row }) => {
      const origen = row.getValue("origen") as string;
      return (
        <span className="text-muted-foreground">
          {ORIGENES_ASIENTO.find((o) => o.value === origen)?.label ?? origen}
        </span>
      );
    },
    size: 150,
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <BadgeEstadoAsiento estado={row.getValue("estado") as any} />
    ),
    size: 120,
  },
  {
    accessorKey: "totalDebe",
    header: () => <div className="text-right">Debe</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-foreground">
        {fmt(row.getValue("totalDebe") as number)}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "totalHaber",
    header: () => <div className="text-right">Haber</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-foreground">
        {fmt(row.getValue("totalHaber") as number)}
      </div>
    ),
    size: 120,
  },
  {
    id: "detalle",
    header: () => <div className="text-right">Detalle</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onSelectAsiento(row.original)}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    ),
    size: 60,
  },
];
