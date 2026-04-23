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
import {
  CostoVentaTipo,
  GastoOperativoTipo,
} from "../Movimientos/movimientos-financieros";
import { Proveedor } from "../Movimientos/types";

const GASTO_OPERATIVO_OPTIONS: Array<{
  value: GastoOperativoTipo;
  label: string;
}> = [
  // ===== EXISTENTES =====
  { value: "SALARIO", label: "Salarios" },
  { value: "ENERGIA", label: "Energía eléctrica" },
  { value: "LOGISTICA", label: "Logística / transporte" },
  { value: "RENTA", label: "Alquiler / renta" },
  { value: "INTERNET", label: "Internet" },
  { value: "PUBLICIDAD", label: "Publicidad" },
  { value: "VIATICOS", label: "Viáticos" },
  { value: "OTROS", label: "Otros gastos" },

  // ===== NUEVOS =====
  { value: "COMBUSTIBLE", label: "Combustible" },
  { value: "MANTENIMIENTO", label: "Mantenimiento general" },
  { value: "REPUESTOS", label: "Repuestos" },
  { value: "LIMPIEZA", label: "Limpieza" },
  { value: "PAPELERIA", label: "Papelería / oficina" },
  { value: "HERRAMIENTAS", label: "Herramientas" },
  { value: "SEGUROS", label: "Seguros" },
  { value: "COMISIONES", label: "Comisiones" },
  { value: "IMPUESTOS", label: "Impuestos" },
  { value: "SERVICIOS_TECNICOS", label: "Servicios técnicos / soporte" },
];

const COSTO_VENTA_OPTIONS: Array<{
  value: CostoVentaTipo;
  label: string;
}> = [
  // ===== EXISTENTES =====
  { value: "MERCADERIA", label: "Mercadería" },
  { value: "FLETE", label: "Flete" },
  { value: "ENCOMIENDA", label: "Encomienda" },
  { value: "TRANSPORTE", label: "Transporte" },
  { value: "OTROS", label: "Otros costos" },

  // ===== NUEVOS =====
  { value: "MATERIA_PRIMA", label: "Materia prima" },
  { value: "MATERIAL_CONSUMIBLE", label: "Material consumible" },
  { value: "SERVICIOS_TERCEROS", label: "Servicios de terceros" },
  { value: "IMPORTACION", label: "Importación / aduana" },
];

// Estilos custom para react-select (reutilizables)
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
  // Transformar proveedores para react-select
  const proveedoresOptions = proveedores.map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  return (
    <div className="space-y-3">
      {requireProveedor && (
        <FormField
          control={form.control}
          name="proveedorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Proveedor</FormLabel>
              <FormControl>
                <Controller
                  control={form.control}
                  name="proveedorId"
                  render={({ field: { value, onChange } }) => (
                    <Select
                      inputId="proveedor-select"
                      options={proveedoresOptions}
                      value={
                        proveedoresOptions.find((opt) => opt.value === value) ||
                        null
                      }
                      onChange={(option) => onChange(option?.value)}
                      styles={selectStyles}
                      isSearchable
                      isClearable={false}
                      placeholder="Selecciona proveedor"
                    />
                  )}
                />
              </FormControl>
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
              <FormControl>
                <Controller
                  control={form.control}
                  name="gastoOperativoTipo"
                  render={({ field: { value, onChange } }) => (
                    <Select
                      inputId="gasto-tipo-select"
                      options={GASTO_OPERATIVO_OPTIONS}
                      value={
                        GASTO_OPERATIVO_OPTIONS.find(
                          (opt) => opt.value === value,
                        ) || null
                      }
                      onChange={(option) => onChange(option?.value)}
                      styles={selectStyles}
                      isSearchable
                      isClearable={false}
                      placeholder="Selecciona tipo"
                    />
                  )}
                />
              </FormControl>
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
              <FormControl>
                <Controller
                  control={form.control}
                  name="costoVentaTipo"
                  render={({ field: { value, onChange } }) => (
                    <Select
                      inputId="costo-tipo-select"
                      options={COSTO_VENTA_OPTIONS}
                      value={
                        COSTO_VENTA_OPTIONS.find(
                          (opt) => opt.value === value,
                        ) || null
                      }
                      onChange={(option) => onChange(option?.value)}
                      styles={selectStyles}
                      isSearchable
                      isClearable={false}
                      placeholder="Selecciona tipo"
                    />
                  )}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
