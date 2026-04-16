"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import {
  CostoVentaTipo,
  GastoOperativoTipo,
} from "../Movimientos/movimientos-financieros";
import { Proveedor } from "../Movimientos/types";

const GASTO_OPERATIVO_OPTIONS: Array<{
  value: GastoOperativoTipo;
  label: string;
}> = [
  { value: "SALARIO", label: "Salario" },
  { value: "ENERGIA", label: "Energía" },
  { value: "LOGISTICA", label: "Logística" },
  { value: "RENTA", label: "Renta" },
  { value: "INTERNET", label: "Internet" },
  { value: "PUBLICIDAD", label: "Publicidad" },
  { value: "VIATICOS", label: "Viáticos" },
  { value: "OTROS", label: "Otros" },
];

const COSTO_VENTA_OPTIONS: Array<{ value: CostoVentaTipo; label: string }> = [
  { value: "MERCADERIA", label: "Mercadería" },
  { value: "FLETE", label: "Flete" },
  { value: "ENCOMIENDA", label: "Encomienda" },
  { value: "TRANSPORTE", label: "Transporte" },
  { value: "OTROS", label: "Otros" },
];

interface Props {
  form: UseFormReturn<any>;
  requireProveedor?: boolean;
  requireSubtipoGO?: boolean;
  requireCostoVentaTipo?: boolean;
  proveedores: Proveedor[];
}

export function CamposCondicionales({
  form,
  requireProveedor,
  requireSubtipoGO,
  requireCostoVentaTipo,
  proveedores,
}: Props) {
  return (
    <div className="space-y-3">
      {requireProveedor && (
        <FormField
          control={form.control}
          name="proveedorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Proveedor</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecciona proveedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {proveedores.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id.toString()}
                      className="text-xs"
                    >
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}

      {requireSubtipoGO && (
        <FormField
          control={form.control}
          name="gastoOperativoTipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">
                Tipo de gasto
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GASTO_OPERATIVO_OPTIONS.map((o) => (
                    <SelectItem
                      key={o.value}
                      value={o.value}
                      className="text-xs"
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}

      {requireCostoVentaTipo && (
        <FormField
          control={form.control}
          name="costoVentaTipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">
                Tipo de costo
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COSTO_VENTA_OPTIONS.map((o) => (
                    <SelectItem
                      key={o.value}
                      value={o.value}
                      className="text-xs"
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
