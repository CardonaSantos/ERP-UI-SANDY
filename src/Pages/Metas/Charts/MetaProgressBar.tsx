"use client";

import { ResponsiveBar } from "@nivo/bar";
import React from "react";

interface MetaProgressBarProps {
  total: number;
  actual: number;
  formatMoney?: (n: number) => string;
  height?: number;
}

type BarDatum = {
  label: string;
  avance: number;
  restante: number;
};

export const MetaProgressBar: React.FC<MetaProgressBarProps> = ({
  total,
  actual,
  formatMoney = (n) => n.toFixed(2),
  height = 80,
}) => {
  if (!total || total <= 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No hay metas registradas
      </div>
    );
  }

  const restante = Math.max(total - actual, 0);
  const porcentaje = total > 0 ? (actual / total) * 100 : 0;

  const data: BarDatum[] = [
    {
      label: "Progreso",
      avance: actual,
      restante,
    },
  ];

  return (
    <div style={{ height }} className="relative">
      <ResponsiveBar<BarDatum>
        data={data}
        keys={["avance", "restante"]}
        indexBy="label"
        layout="horizontal"
        groupMode="stacked"
        padding={0.4}
        margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
        enableGridX={false}
        enableGridY={false}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}
        enableLabel={false}
        isInteractive
        colors={["rgb(34,197,94)", "rgb(226,232,240)"]}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        tooltip={({ id, value }) => {
          const pct =
            id === "avance"
              ? porcentaje
              : total > 0
              ? (restante / total) * 100
              : 0;

          return (
            <div className="rounded bg-zinc-900 text-white text-xs px-2 py-1 space-y-0.5">
              <div className="font-semibold">
                {id === "avance" ? "Avance" : "Restante"}
              </div>
              <div>{formatMoney(Number(value))}</div>
              <div className="opacity-80">{pct.toFixed(2)}%</div>
            </div>
          );
        }}
        animate
        motionConfig="gentle"
        role="img"
      />

      {/* Texto centrado global */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-white drop-shadow">
          {porcentaje.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
