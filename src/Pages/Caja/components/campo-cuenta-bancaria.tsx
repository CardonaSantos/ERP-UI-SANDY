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
import { Landmark } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CuentaBancaria } from "../Movimientos/movimientos-financieros";

interface Props {
  form: UseFormReturn<any>;
  cuentasBancarias: CuentaBancaria[];
}

export function CampoCuentaBancaria({ form, cuentasBancarias }: Props) {
  return (
    <FormField
      control={form.control}
      name="cuentaBancariaId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-medium flex items-center gap-1">
            <Landmark className="h-3 w-3" aria-hidden="true" />
            Cuenta bancaria
          </FormLabel>
          <Select
            onValueChange={(v) => field.onChange(Number(v))}
            value={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecciona cuenta" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {cuentasBancarias.map((c) => (
                <SelectItem
                  key={c.id}
                  value={c.id.toString()}
                  className="text-xs"
                >
                  {c.alias ? `${c.alias} · ` : ""}
                  {c.banco}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
