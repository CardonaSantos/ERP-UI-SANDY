import { cn } from "@/lib/utils";
import {
  EstadoAsientoContable,
  NaturalezaCuentaContable,
  TipoCuentaContable,
} from "@/Types/contabilidad/types-enums";

export function BadgeEstadoAsiento({
  estado,
}: {
  estado: EstadoAsientoContable;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        estado === "POSTEADO" && "bg-emerald-100 text-emerald-700",
        estado === "BORRADOR" && "bg-amber-100 text-amber-700",
        estado === "ANULADO" && "bg-red-100 text-red-700",
      )}
    >
      {estado === "POSTEADO" && "Posteado"}
      {estado === "BORRADOR" && "Borrador"}
      {estado === "ANULADO" && "Anulado"}
    </span>
  );
}

export function BadgeActiva({ activa }: { activa: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        activa
          ? "bg-emerald-100 text-emerald-700"
          : "bg-muted text-muted-foreground",
      )}
    >
      {activa ? "Activa" : "Inactiva"}
    </span>
  );
}

export function BadgeTipoCuenta({ tipo }: { tipo: TipoCuentaContable }) {
  const colors: Record<TipoCuentaContable, string> = {
    ACTIVO: "bg-blue-100 text-blue-700",
    PASIVO: "bg-orange-100 text-orange-700",
    PATRIMONIO: "bg-purple-100 text-purple-700",
    INGRESO: "bg-emerald-100 text-emerald-700",
    COSTO: "bg-yellow-100 text-yellow-700",
    GASTO: "bg-red-100 text-red-700",
    ORDEN: "bg-muted text-muted-foreground",
  };
  const labels: Record<TipoCuentaContable, string> = {
    ACTIVO: "Activo",
    PASIVO: "Pasivo",
    PATRIMONIO: "Patrimonio",
    INGRESO: "Ingreso",
    COSTO: "Costo",
    GASTO: "Gasto",
    ORDEN: "Orden",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        colors[tipo],
      )}
    >
      {labels[tipo]}
    </span>
  );
}

export function BadgeNaturaleza({
  naturaleza,
}: {
  naturaleza: NaturalezaCuentaContable;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        naturaleza === "DEUDORA"
          ? "bg-blue-50 text-blue-600"
          : "bg-orange-50 text-orange-600",
      )}
    >
      {naturaleza === "DEUDORA" ? "Deudora" : "Acreedora"}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
      {message}
    </div>
  );
}

export function LoadingRows({ cols = 4 }: { cols?: number }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-3 py-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
