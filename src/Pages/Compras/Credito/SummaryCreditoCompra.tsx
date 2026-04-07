import dayjs from "dayjs";
import "dayjs/locale/es";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TZGT } from "@/Pages/Utils/Utils";
import { ShieldQuestion } from "lucide-react";
import { PlanPreview } from "./interfaces/types";

export function SummaryCreditoCompra({ preview }: { preview: PlanPreview }) {
  return (
    <section
      aria-labelledby="summary-title"
      className="mt-3 rounded-md border p-3 space-y-2"
    >
      <div className="flex items-center gap-1.5">
        <ShieldQuestion className="h-3.5 w-3.5 text-muted-foreground" />
        <span id="summary-title" className="text-xs font-medium">
          Resumen del plan
        </span>
        <span className="text-[11px] text-muted-foreground ml-auto">
          Principal:{" "}
          <b className="text-foreground">
            Q {preview.principalFinanciado.toFixed(2)}
          </b>{" "}
          · Interés:{" "}
          <b className="text-foreground">Q {preview.interesTotal.toFixed(2)}</b>
        </span>
      </div>

      {/* header */}
      <div className="grid grid-cols-12 text-[10px] font-medium text-muted-foreground border-b pb-1">
        <div className="col-span-2">#</div>
        <div className="col-span-5">Vencimiento</div>
        <div className="col-span-5 text-right">Monto</div>
      </div>

      <div className="max-h-56 overflow-y-auto divide-y">
        {preview.cuotas.map((c, idx) => {
          const isEnganche = c.isEnganche === true;
          return (
            <div
              key={c.id ?? c.numero}
              className="grid grid-cols-12 py-1.5 text-xs items-center"
            >
              <div className="col-span-2">
                {isEnganche ? (
                  <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground">
                    Enganche
                  </span>
                ) : (
                  idx + 1
                )}
              </div>
              <div className="col-span-5 text-muted-foreground">
                {dayjs(c.fechaISO).tz(TZGT).format("ddd DD/MM/YYYY")}
              </div>
              <div className="col-span-5 text-right font-medium">
                Q {c.monto.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <Separator />
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Total a pagar</span>
        <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
          Q {preview.totalAPagar.toFixed(2)}
        </Badge>
      </div>
    </section>
  );
}
