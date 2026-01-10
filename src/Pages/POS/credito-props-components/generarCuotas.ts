import dayjs from "dayjs";
import {
  InteresTipoCreditoVenta,
  PlanCuotaModo,
  PropuestaCuota,
} from "./credito-venta.interfaces";

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function repartirConPesos(total: number, pesos: number[]): number[] {
  const sumPesos = pesos.reduce((a, b) => a + b, 0) || 1;
  const brutos = pesos.map((p) => (total * p) / sumPesos);
  const rounded = brutos.map(r2);
  const diff = r2(total - rounded.reduce((a, b) => r2(a + b), 0));
  if (Math.abs(diff) >= 0.01) {
    rounded[rounded.length - 1] = r2(rounded[rounded.length - 1] + diff);
  }
  return rounded;
}

function aplicarInteresSobreVenta(total: number, interesPct: number): number {
  if (!interesPct || interesPct <= 0) return r2(total);
  return r2(total * (1 + interesPct / 100));
}

export function generarCuotas({
  totalProductos,
  enganche,
  cuotasTotales,
  plan,
  fechaPrimeraCuota,
  diasEntrePagos,
  interesSobreVenta,
}: {
  totalProductos: number;
  enganche: number;
  cuotasTotales: number;
  plan: PlanCuotaModo;
  fechaPrimeraCuota: string;
  diasEntrePagos: number;
  interesTipo: InteresTipoCreditoVenta;
  interesPorcentaje: number;
  interesSobreVenta: number;
}): PropuestaCuota[] {
  const cuotas: PropuestaCuota[] = [];
  const hoy = dayjs().format("YYYY-MM-DD");

  if (enganche > 0) {
    cuotas.push({
      numero: 0,
      fechaISO: hoy,
      monto: r2(enganche),
      etiqueta: "ENGANCHE",
    });
  }

  const totalConInteres = aplicarInteresSobreVenta(
    totalProductos,
    interesSobreVenta
  );

  const principalBase = Math.max(0, r2(totalConInteres - enganche));
  const n = Math.max(1, Number(cuotasTotales) || 1);

  let pesos: number[] = [];
  if (plan === "IGUALES" || plan === "PRIMERA_MAYOR") {
    pesos = Array.from({ length: n }, () => 1);
  } else if (plan === "CRECIENTES") {
    pesos = Array.from({ length: n }, (_, i) => i + 1);
  } else {
    pesos = Array.from({ length: n }, (_, i) => n - i);
  }

  const montos = repartirConPesos(principalBase, pesos);

  const primera = fechaPrimeraCuota || hoy;
  for (let i = 0; i < n; i++) {
    cuotas.push({
      numero: i + 1,
      fechaISO: dayjs(primera)
        .add(i * (Number(diasEntrePagos) || 30), "day")
        .format("YYYY-MM-DD"),
      monto: r2(montos[i]),
      etiqueta: "NORMAL",
    });
  }

  return cuotas;
}
