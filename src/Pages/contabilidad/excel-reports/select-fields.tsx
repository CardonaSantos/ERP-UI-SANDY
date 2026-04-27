"use client";

import ReactSelect, { SingleValue, StylesConfig } from "react-select";
import { SelectOption } from "./types";

interface SelectFieldProps<T = number> {
  label: string;
  options: SelectOption<T>[];
  value?: SelectOption<T> | null;
  onChange: (option: SingleValue<SelectOption<T>>) => void;
  placeholder?: string;
  isClearable?: boolean;
  isRequired?: boolean;
}

// Estilos adaptados al design system (bg-background / border-input / ring)
function buildStyles<T>(): StylesConfig<SelectOption<T>, false> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: "32px",
      height: "32px",
      fontSize: "0.875rem",
      backgroundColor: "var(--color-background, #fff)",
      borderColor: state.isFocused
        ? "var(--color-ring, #a3a3a3)"
        : "var(--color-border, #e5e7eb)",
      boxShadow: state.isFocused
        ? "0 0 0 1px var(--color-ring, #a3a3a3)"
        : "none",
      borderRadius: "var(--radius-md, 6px)",
      "&:hover": { borderColor: "var(--color-ring, #a3a3a3)" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 8px", height: "30px" }),
    singleValue: (base) => ({
      ...base,
      color: "var(--color-foreground, #111827)",
      fontSize: "0.875rem",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--color-muted-foreground, #6b7280)",
      fontSize: "0.875rem",
    }),
    indicatorsContainer: (base) => ({ ...base, height: "30px" }),
    dropdownIndicator: (base) => ({ ...base, padding: "0 6px" }),
    clearIndicator: (base) => ({ ...base, padding: "0 4px" }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--color-popover, #fff)",
      border: "1px solid var(--color-border, #e5e7eb)",
      borderRadius: "var(--radius-md, 6px)",
      fontSize: "0.875rem",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--color-primary, #111)"
        : state.isFocused
          ? "var(--color-accent, #f3f4f6)"
          : "transparent",
      color: state.isSelected
        ? "var(--color-primary-foreground, #fff)"
        : "var(--color-foreground, #111)",
      fontSize: "0.875rem",
      padding: "6px 10px",
      cursor: "pointer",
    }),
    input: (base) => ({
      ...base,
      color: "var(--color-foreground, #111)",
      margin: 0,
      padding: 0,
    }),
  };
}

export function SelectField<T = number>({
  label,
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  isClearable = true,
  isRequired = false,
}: SelectFieldProps<T>) {
  const styles = buildStyles<T>();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
        {isRequired && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <ReactSelect<SelectOption<T>, false>
        options={options}
        value={value ?? null}
        onChange={onChange}
        placeholder={placeholder}
        isClearable={isClearable}
        styles={styles}
        noOptionsMessage={() => "Sin resultados"}
      />
    </div>
  );
}
