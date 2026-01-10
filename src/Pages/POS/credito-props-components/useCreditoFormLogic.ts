import * as React from "react";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const TZGT = "America/Guatemala";
import { FormCreditoState, PropuestaCuota } from "./credito-venta.interfaces";
import { generarCuotas } from "./generarCuotas";
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

type Params = {
  value: FormCreditoState;
  setForm: React.Dispatch<React.SetStateAction<FormCreditoState>>;
  autoRecalc: boolean;
  userRol: string;
};

export function useCreditoFormLogic({
  value,
  setForm,
  autoRecalc,
  userRol,
}: Params) {
  const form = value;
  const [editingCuotas, setEditingCuotas] = React.useState(false);

  React.useEffect(() => {
    if (!autoRecalc || editingCuotas) return;

    setForm((prev) => ({
      ...prev,
      cuotasPropuestas: buildCuotas(prev),
    }));
  }, [
    autoRecalc,
    editingCuotas,
    form.totalPropuesto,
    form.cuotaInicialPropuesta,
    form.cuotasTotalesPropuestas,
    form.planCuotaModo,
    form.fechaPrimeraCuota,
    form.diasEntrePagos,
    form.interesTipo,
    form.interesPorcentaje,
    form.interesSobreVenta,
    setForm,
  ]);

  const cuotas = Array.isArray(form.cuotasPropuestas)
    ? form.cuotasPropuestas
    : [];

  const engancheUI = r2(
    cuotas.find((c) => c?.etiqueta === "ENGANCHE" || c?.numero === 0)?.monto ??
      (form.planCuotaModo === "PRIMERA_MAYOR" ? form.cuotaInicialPropuesta : 0)
  );

  const totalUI = r2(form.totalPropuesto);
  const principalUI = r2(totalUI - engancheUI);

  const sumCuotasSinEnganche = r2(
    cuotas
      .filter((c) => c.etiqueta !== "ENGANCHE")
      .reduce((acc, c) => acc + r2(c.monto), 0)
  );

  const isConsistent = Math.abs(sumCuotasSinEnganche - principalUI) <= 0.01;
  const isVendedor = userRol !== "ADMIN";

  function setField<K extends keyof FormCreditoState>(
    key: K,
    v: FormCreditoState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  function updateCuota(idx: number, patch: Partial<PropuestaCuota>) {
    setForm((prev) => {
      const next = [...(prev.cuotasPropuestas || [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, cuotasPropuestas: next };
    });
  }

  function updateCuotaFecha(idx: number, nuevaFechaISO: string) {
    setForm((prev) => {
      const next = [...(prev.cuotasPropuestas || [])];
      if (!next[idx]) return prev;

      next[idx] = { ...next[idx], fechaISO: nuevaFechaISO };

      if (next[idx].etiqueta === "ENGANCHE")
        return { ...prev, cuotasPropuestas: next };

      const intervalo = Math.max(1, Number(prev.diasEntrePagos || 30));
      for (let j = idx + 1; j < next.length; j++) {
        if (next[j].etiqueta === "ENGANCHE") continue;
        next[j] = {
          ...next[j],
          fechaISO: dayjs(nuevaFechaISO)
            .add((j - idx) * intervalo, "day")
            .format("YYYY-MM-DD"),
        };
      }

      if (next[idx].numero === 1) {
        return {
          ...prev,
          fechaPrimeraCuota: nuevaFechaISO,
          cuotasPropuestas: next,
        };
      }

      return { ...prev, cuotasPropuestas: next };
    });
  }

  function handleRegenerarCuotas() {
    setForm((prev) => ({ ...prev, cuotasPropuestas: buildCuotas(prev) }));
  }

  return {
    form,
    editingCuotas,
    setEditingCuotas,
    cuotas,
    totalUI,
    engancheUI,
    principalUI,
    sumCuotasSinEnganche,
    isConsistent,
    isVendedor,
    setField,
    updateCuota,
    updateCuotaFecha,
    handleRegenerarCuotas,
  };
}

// Helpers internos
function buildCuotas(prev: FormCreditoState) {
  const enganche =
    prev.planCuotaModo === "PRIMERA_MAYOR"
      ? Number(prev.cuotaInicialPropuesta || 0)
      : 0;

  return generarCuotas({
    totalProductos: Number(prev.totalPropuesto || 0),
    enganche,
    cuotasTotales: Number(prev.cuotasTotalesPropuestas || 1),
    plan: prev.planCuotaModo,
    fechaPrimeraCuota: prev.fechaPrimeraCuota || dayjs().format("YYYY-MM-DD"),
    diasEntrePagos: Number(prev.diasEntrePagos || 30),
    interesTipo: prev.interesTipo,
    interesPorcentaje: Number(prev.interesPorcentaje || 0),
    interesSobreVenta: Number(prev.interesSobreVenta || 0),
  });
}
