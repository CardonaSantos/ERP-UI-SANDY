"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn, Controller } from "react-hook-form";
import Select from "react-select";
import { CuentaBancaria } from "../Movimientos/movimientos-financieros";

// Estilos custom para react-select
const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: "32px",
    height: "32px",
    fontSize: "0.75rem",
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    "&:hover": {
      borderColor: "#9ca3af",
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: "0.75rem",
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
        ? "#f3f4f6"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#000000",
    padding: "6px 12px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: state.isSelected ? "#3b82f6" : "#f3f4f6",
    },
  }),
  menu: (base: any) => ({
    ...base,
    fontSize: "0.75rem",
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "200px",
  }),
  input: (base: any) => ({
    ...base,
    fontSize: "0.75rem",
    margin: 0,
    padding: 0,
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: "2px 8px",
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    height: "32px",
  }),
};

interface Props {
  form: UseFormReturn<any>;
  cuentasBancarias: CuentaBancaria[];
}

export function CampoCuentaBancaria({ form, cuentasBancarias }: Props) {
  // Transformar cuentas bancarias para react-select
  const cuentasOptions = cuentasBancarias.map((c) => ({
    value: c.id,
    label: `${c.banco} - ${c.numero}${c.alias ? ` (${c.alias})` : ""}`,
  }));

  return (
    <FormField
      control={form.control}
      name="cuentaBancariaId"
      render={() => (
        <FormItem>
          <FormLabel className="text-xs font-medium">Cuenta bancaria</FormLabel>
          <FormControl>
            <Controller
              control={form.control}
              name="cuentaBancariaId"
              render={({ field: { value, onChange } }) => (
                <Select
                  inputId="cuenta-bancaria-select"
                  options={cuentasOptions}
                  value={
                    cuentasOptions.find((opt) => opt.value === value) || null
                  }
                  onChange={(option) => onChange(option?.value)}
                  styles={selectStyles}
                  isSearchable
                  isClearable={false}
                  placeholder="Selecciona cuenta bancaria"
                />
              )}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
