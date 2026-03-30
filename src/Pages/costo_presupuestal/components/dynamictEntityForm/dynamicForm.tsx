/**
 * DynamicEntityForm.tsx
 * Senior Frontend Architect · ERP Generic Form Engine
 *
 * Dependencias requeridas:
 *   react-hook-form, zod, @hookform/resolvers
 *   @radix-ui/react-popover, @radix-ui/react-switch
 *   shadcn/ui: Form, Calendar, Popover, Switch, Button
 *   react-select
 *   date-fns
 *   lucide-react
 */

import React from "react";
import {
  useForm,
  Controller,
  FieldValues,
  DefaultValues,
  Resolver,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UseMutationResult } from "@tanstack/react-query";
import ReactSelect, { SingleValue } from "react-select";
import { Loader2, CheckCircle2 } from "lucide-react";

// ─── Shadcn UI ────────────────────────────────────────────────────────────────
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { cn } from "@/lib/utils";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "date"
  | "boolean"
  | "select";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: SelectOption[]; // Requerido cuando type === 'select'
  disabled?: boolean;
  className?: string;
}

export interface DynamicEntityFormProps<
  TData extends FieldValues = FieldValues,
  TResult = unknown,
  TError = unknown, // ← sin "extends Error"
> {
  /** Array de configuración de campos del formulario */
  config: FieldConfig[];
  /** Esquema Zod para validación */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: z.ZodTypeAny;
  /** Hook de mutación de React Query (usePostPartida, usePostPeriodo, etc.) */
  // mutationHook: () => UseMutationResult<unknown, Error, TData, unknown>;
  mutationHook: () => UseMutationResult<TResult, TError, TData, unknown>;

  /** Callback ejecutado tras mutación exitosa */
  onSuccess?: (data: unknown) => void;
  /** Valores iniciales opcionales (útil para edición) */
  defaultValues?: DefaultValues<TData>;
  /** Texto del botón de submit */
  submitLabel?: string;
  /** Layout en columnas (default: 1) */
  columns?: 1 | 2 | 3;
}

interface FieldRendererProps {
  field: FieldConfig;
  control: any;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, control }) => {
  return (
    <FormField
      control={control}
      name={field.name}
      render={({ field: rhfField, fieldState }) => (
        <FormItem className={cn("flex flex-col gap-0.5", field.className)}>
          <FormLabel className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {field.label}
          </FormLabel>

          <FormControl>
            <>
              {/* ── TEXT ─────────────────────────────────────────── */}
              {field.type === "text" && (
                <Input
                  {...rhfField}
                  disabled={field.disabled}
                  placeholder={field.placeholder}
                  value={rhfField.value ?? ""}
                  className={cn(
                    "h-8 rounded border px-2.5 text-xs",
                    "placeholder:text-muted-foreground/50",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                    "focus-visible:border-foreground/60",
                    "transition-colors duration-100",
                    fieldState.error && "border-destructive",
                  )}
                />
              )}

              {/* ── NUMBER ───────────────────────────────────────── */}
              {field.type === "number" && (
                <Input
                  {...rhfField}
                  type="number"
                  disabled={field.disabled}
                  placeholder={field.placeholder}
                  value={rhfField.value ?? ""}
                  onChange={(e) =>
                    rhfField.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className={cn(
                    "h-8 rounded border px-2.5 text-xs",
                    "placeholder:text-muted-foreground/50",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                    "focus-visible:border-foreground/60",
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    fieldState.error && "border-destructive",
                  )}
                />
              )}

              {/* ── TEXTAREA ─────────────────────────────────────── */}
              {field.type === "textarea" && (
                <Textarea
                  {...rhfField}
                  disabled={field.disabled}
                  placeholder={field.placeholder}
                  value={rhfField.value ?? ""}
                  rows={3}
                  className={cn(
                    "rounded border px-2.5 py-1.5 text-xs resize-none",
                    "placeholder:text-muted-foreground/50",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                    "focus-visible:border-foreground/60",
                    "transition-colors duration-100",
                    fieldState.error && "border-destructive",
                  )}
                />
              )}

              {/* ── DATE — input nativo del navegador ─────────────── */}
              {field.type === "date" && (
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: ctrl }) => (
                    <input
                      type="date"
                      disabled={field.disabled}
                      value={
                        ctrl.value instanceof Date
                          ? ctrl.value.toISOString().split("T")[0]
                          : (ctrl.value ?? "")
                      }
                      onChange={(e) =>
                        ctrl.onChange(
                          e.target.value ? new Date(e.target.value) : null,
                        )
                      }
                      className={cn(
                        "h-8 w-full rounded border bg-background px-2.5 text-xs",
                        "text-foreground placeholder:text-muted-foreground/50",
                        "focus:outline-none focus:border-foreground/60",
                        "transition-colors duration-100",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        fieldState.error && "border-destructive",
                      )}
                    />
                  )}
                />
              )}

              {/* ── SELECT ───────────────────────────────────────── */}
              {field.type === "select" && (
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: ctrl }) => {
                    const current =
                      field.options?.find((o) => o.value === ctrl.value) ??
                      null;

                    return (
                      <ReactSelect<SelectOption, false>
                        inputId={`select-${field.name}`}
                        options={field.options ?? []}
                        value={current}
                        isDisabled={field.disabled}
                        placeholder={field.placeholder ?? "Seleccionar…"}
                        isClearable
                        noOptionsMessage={() => "Sin opciones"}
                        onChange={(opt: SingleValue<SelectOption>) =>
                          ctrl.onChange(opt ? opt.value : null)
                        }
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "32px",
                            height: "32px",
                            fontSize: "0.75rem", // text-xs
                            borderRadius: "4px",
                            borderColor: fieldState.error
                              ? "hsl(var(--destructive))"
                              : state.isFocused
                                ? "hsl(var(--foreground) / 0.6)"
                                : "hsl(var(--border))",
                            boxShadow: "none",
                            backgroundColor: "hsl(var(--background))",
                            cursor: "pointer",
                            "&:hover": {
                              borderColor: "hsl(var(--foreground) / 0.4)",
                            },
                            transition: "border-color 100ms ease",
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: "0 8px",
                            height: "32px",
                          }),
                          singleValue: (base) => ({
                            ...base,
                            fontSize: "0.75rem",
                            fontWeight: 400, // sin negrita
                            color: "hsl(var(--foreground))",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontSize: "0.75rem",
                            color: "hsl(var(--muted-foreground) / 0.5)",
                          }),
                          input: (base) => ({
                            ...base,
                            fontSize: "0.75rem",
                            margin: 0,
                            padding: 0,
                            color: "hsl(var(--foreground))",
                          }),
                          indicatorsContainer: (base) => ({
                            ...base,
                            height: "32px",
                          }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            padding: "0 6px",
                            color: "hsl(var(--muted-foreground))",
                          }),
                          clearIndicator: (base) => ({
                            ...base,
                            padding: "0 4px",
                            color: "hsl(var(--muted-foreground))",
                            "&:hover": { color: "hsl(var(--destructive))" },
                          }),
                          indicatorSeparator: () => ({ display: "none" }),
                          menu: (base) => ({
                            ...base,
                            fontSize: "0.75rem",
                            borderRadius: "6px",
                            border: "1px solid hsl(var(--border))",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            backgroundColor: "hsl(var(--background))",
                            zIndex: 50,
                          }),
                          option: (base, state) => ({
                            ...base,
                            fontSize: "0.75rem",
                            fontWeight: 400, // sin negrita en opciones
                            color: state.isSelected
                              ? "hsl(var(--background))"
                              : "hsl(var(--foreground))",
                            backgroundColor: state.isSelected
                              ? "hsl(var(--foreground))"
                              : state.isFocused
                                ? "hsl(var(--muted))"
                                : "transparent",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }),
                          menuList: (base) => ({ ...base, padding: "4px 0" }),
                          noOptionsMessage: (base) => ({
                            ...base,
                            fontSize: "0.75rem",
                            color: "hsl(var(--muted-foreground))",
                          }),
                        }}
                      />
                    );
                  }}
                />
              )}

              {/* ── BOOLEAN ──────────────────────────────────────── */}
              {field.type === "boolean" && (
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: ctrl }) => (
                    <div className="flex items-center gap-2 h-8">
                      <Switch
                        id={`switch-${field.name}`}
                        checked={!!ctrl.value}
                        onCheckedChange={ctrl.onChange}
                        disabled={field.disabled}
                        className="h-4 w-8 data-[state=checked]:bg-foreground data-[state=unchecked]:bg-border"
                      />
                      <label
                        htmlFor={`switch-${field.name}`}
                        className="text-xs text-muted-foreground cursor-pointer select-none"
                      >
                        {ctrl.value ? "Activo" : "Inactivo"}
                      </label>
                    </div>
                  )}
                />
              )}
            </>
          </FormControl>

          <FormMessage className="text-[11px] text-destructive mt-0.5" />
        </FormItem>
      )}
    />
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────

export function DynamicEntityForm<
  TData extends FieldValues = FieldValues,
  TResult = unknown,
  TError = unknown,
>({
  config,
  validationSchema,
  mutationHook,
  onSuccess,
  defaultValues,
  submitLabel = "Guardar",
  columns = 1,
}: DynamicEntityFormProps<TData, TResult, TError>) {
  const form = useForm<TData>({
    resolver: zodResolver(validationSchema as any) as Resolver<TData>,
    defaultValues: defaultValues ?? ({} as DefaultValues<TData>),
    mode: "onSubmit",
  });

  const mutation = mutationHook();

  const onSubmit: SubmitHandler<TData> = (data) => {
    mutation.mutate(data, {
      onSuccess: (response) => {
        form.reset();
        onSuccess?.(response);
      },
      onError: (error) => {
        toast.error(getApiErrorMessageAxios(error));
      },
    });
  };

  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* ── Grid de campos ──────────────────────────────────────── */}
        <div className={cn("grid gap-x-4 gap-y-3", gridClass)}>
          {config.map((fieldCfg) => (
            <FieldRenderer
              key={fieldCfg.name}
              field={fieldCfg}
              control={form.control}
            />
          ))}
        </div>

        {/* ── Separador ───────────────────────────────────────────── */}
        <div className="h-px bg-slate-100 w-full" />

        {/* ── Footer: error global + submit ───────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          {/* Success inline */}
          {mutation.isSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Guardado correctamente
            </span>
          )}

          {/* Spacer */}
          {!mutation.isError && !mutation.isSuccess && <span />}

          {/* Submit */}
          <Button
            type="submit"
            size="sm"
            disabled={mutation.isPending}
            className={cn(
              "h-7 px-4 text-xs font-semibold uppercase ",
              "bg-slate-900  ",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-100",
            )}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Guardando…
              </span>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default DynamicEntityForm;
