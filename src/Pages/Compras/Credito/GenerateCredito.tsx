import React, { useMemo } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/es";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TZGT } from "@/Pages/Utils/Utils";
import { Calendar, Percent, Timer, Wallet } from "lucide-react";
import { toNumber } from "./helpers/helpers1";
import {
  CreditoCompraForm,
  GeneracionModo,
  InteresTipo,
  PlanCuotaModo,
  ProveedorOption,
  RecepcionValorada,
} from "./interfaces/types";
import { buildPlanPreview } from "./helpers/helpers2";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.locale("es");

interface GenerateProps {
  form: CreditoCompraForm;
  setForm: React.Dispatch<React.SetStateAction<CreditoCompraForm>>;
  proveedores: ProveedorOption[];
  recepciones?: RecepcionValorada[];
  compraTotal: number;
  cuentasBancarias: { id: number; nombre: string }[];
}

export function GenerateCredito({
  form,
  setForm,
  proveedores,
  recepciones = [],
  compraTotal,
}: GenerateProps) {
  const hasRecepciones = recepciones.length > 0;

  const baseMonto = useMemo(() => {
    if (form.modo === "POR_RECEPCION" && form.recepcionId) {
      const r = recepciones.find((x) => x.id === form.recepcionId);
      return r?.valor ?? form.montoOriginal ?? compraTotal;
    }
    return form.montoOriginal ?? compraTotal;
  }, [
    form.modo,
    form.recepcionId,
    form.montoOriginal,
    recepciones,
    compraTotal,
  ]);

  const onNumber =
    (field: keyof CreditoCompraForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = toNumber(e.target.value || 0);
      setForm((p) => ({ ...p, [field]: isFinite(v) ? v : 0 }));
    };

  const onPercent =
    (field: keyof CreditoCompraForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = toNumber(e.target.value || 0);
      if (v > 1) v = v / 100;
      setForm((p) => ({ ...p, [field]: isFinite(v) ? v : 0 }));
    };

  const onEngancheChange = (tipo: "Q" | "%", valor: number) => {
    setForm((p) => ({ ...p, enganche: { tipo, valor } }));
  };

  const preview = useMemo(
    () =>
      buildPlanPreview({
        montoTotal: baseMonto,
        fechaEmisionISO: form.fechaEmisionISO,
        diasCredito: form.diasCredito,
        diasEntrePagos: form.diasEntrePagos,
        n: form.cantidadCuotas,
        interesTipo: form.interesTipo,
        interes: form.interes,
        planCuotaModo: form.planCuotaModo,
        enganche:
          form.planCuotaModo === PlanCuotaModo.PRIMERA_MAYOR
            ? form.enganche
            : null,
      }),
    [baseMonto, form],
  );

  /* ---- field helpers ---- */
  const Field = ({
    label,
    hint,
    children,
    colSpan,
  }: {
    label: string;
    hint?: string;
    children: React.ReactNode;
    colSpan?: string;
  }) => (
    <div className={`space-y-1 ${colSpan ?? ""}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint && (
        <p className="text-[11px] text-muted-foreground leading-tight">
          {hint}
        </p>
      )}
    </div>
  );

  return (
    <section
      aria-labelledby="gen-credito-title"
      className="rounded-md border p-3 space-y-3"
    >
      <p id="gen-credito-title" className="text-xs font-medium">
        Generar crédito de compra
      </p>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {/* Modo */}
        <Field label="Modo">
          <Select
            value={form.modo}
            onValueChange={(v: GeneracionModo) =>
              setForm((p) => ({ ...p, modo: v }))
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Seleccionar modo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="POR_COMPRA" className="text-xs">
                  Por compra
                </SelectItem>
                <SelectItem
                  value="POR_RECEPCION"
                  disabled={!hasRecepciones}
                  className="text-xs"
                >
                  Por recepción
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Recepción (condicional) */}
        {form.modo === "POR_RECEPCION" && (
          <Field label="Recepción">
            <Select
              value={form.recepcionId ? String(form.recepcionId) : undefined}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, recepcionId: Number(v) }))
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecciona una recepción" />
              </SelectTrigger>
              <SelectContent>
                {recepciones.map((r) => (
                  <SelectItem
                    key={r.id}
                    value={String(r.id)}
                    className="text-xs"
                  >
                    #{r.id} · {r.folio ?? "REC"}-{r.id} · Q {r.valor.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {/* Proveedor */}
        <Field label="Proveedor">
          <Select
            value={String(form.proveedorId)}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, proveedorId: Number(v) }))
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Seleccionar proveedor" />
            </SelectTrigger>
            <SelectContent>
              {proveedores.map((p) => (
                <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Monto */}
        <Field
          label="Monto a financiar (Q)"
          hint="Default: total de compra o valor de la recepción."
        >
          <Input
            className="h-8 text-xs"
            inputMode="decimal"
            value={String(form.montoOriginal ?? baseMonto)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                montoOriginal: toNumber(e.target.value),
              }))
            }
          />
        </Field>

        {/* Fecha de emisión */}
        <Field label="Fecha de emisión">
          <Input
            className="h-8 text-xs"
            type="date"
            value={
              form.fechaEmisionISO
                ? dayjs(form.fechaEmisionISO).tz(TZGT).format("YYYY-MM-DD")
                : dayjs().tz(TZGT).format("YYYY-MM-DD")
            }
            onChange={(e) => {
              const raw = e.target.value;
              setForm((p) => ({
                ...p,
                fechaEmisionISO: raw
                  ? dayjs.tz(raw, TZGT).toISOString()
                  : dayjs().tz(TZGT).toISOString(),
              }));
            }}
          />
        </Field>

        {/* Días entre pagos */}
        <Field label="Días entre pagos">
          <Input
            className="h-8 text-xs"
            inputMode="numeric"
            value={form.diasEntrePagos}
            onChange={onNumber("diasEntrePagos")}
          />
        </Field>

        {/* Cantidad de cuotas */}
        <Field label="Cuotas (sin contar enganche)">
          <Input
            className="h-8 text-xs"
            inputMode="numeric"
            value={form.cantidadCuotas}
            onChange={onNumber("cantidadCuotas")}
          />
        </Field>

        {/* Tipo de interés */}
        <Field label="Tipo de interés">
          <Select
            value={form.interesTipo}
            onValueChange={(v: InteresTipo) =>
              setForm((p) => ({ ...p, interesTipo: v }))
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={InteresTipo.NONE} className="text-xs">
                  Sin interés
                </SelectItem>
                <SelectItem value={InteresTipo.SIMPLE} className="text-xs">
                  Simple (sobre saldo)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Interés */}
        <Field
          label="Interés"
          hint="Tasa por periodo. Acepta 0.02 o 2 (se normaliza a 0.02)."
        >
          <div className="relative flex items-center">
            <Percent className="absolute left-2 h-3 w-3 text-muted-foreground pointer-events-none" />
            <Input
              className="h-8 text-xs pl-6"
              inputMode="decimal"
              placeholder="0.02 = 2%"
              value={String(form.interes)}
              onChange={onPercent("interes")}
              disabled={form.interesTipo === InteresTipo.NONE}
            />
          </div>
        </Field>

        {/* Modo de generación */}
        <Field label="Modo de generación">
          <Select
            value={form.planCuotaModo}
            onValueChange={(v: PlanCuotaModo) =>
              setForm((p) => ({ ...p, planCuotaModo: v }))
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Seleccionar modo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={PlanCuotaModo.IGUALES} className="text-xs">
                  Iguales (ajuste final)
                </SelectItem>
                <SelectItem
                  value={PlanCuotaModo.PRIMERA_MAYOR}
                  className="text-xs"
                >
                  Primera mayor (enganche)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Enganche */}
        {form.planCuotaModo === PlanCuotaModo.PRIMERA_MAYOR && (
          <Field label="Enganche / primera mayor" colSpan="sm:col-span-2">
            <Input
              className="h-8 text-xs"
              inputMode="decimal"
              value={String(form.enganche?.valor ?? 0)}
              onChange={(e) =>
                onEngancheChange(
                  form.enganche?.tipo ?? "Q",
                  toNumber(e.target.value || 0),
                )
              }
            />
          </Field>
        )}
      </div>

      {/* Footer compacto */}
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground border-t pt-2">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          1ra cuota:{" "}
          {dayjs(preview.cuotas[0]?.fechaISO).tz(TZGT).format("DD/MM/YYYY")} · Q{" "}
          {preview.cuotas[0]?.monto.toFixed(2)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Timer className="h-3 w-3" />
          {preview.cuotas.length} cuotas
        </span>
        <span className="inline-flex items-center gap-1">
          <Wallet className="h-3 w-3" />
          Total: Q {preview.totalAPagar.toFixed(2)} (interés: Q{" "}
          {preview.interesTotal.toFixed(2)})
        </span>
      </div>
    </section>
  );
}
