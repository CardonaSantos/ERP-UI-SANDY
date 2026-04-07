import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { PlanCuotaFila } from "./interfaces/types";

type Props = {
  isManual: boolean;
  cuotas: PlanCuotaFila[] | null;
  adoptPreview: () => void;
  resetToPreview: () => void;
  editCuotaFecha: (id: string, ymd: string) => void;
  editCuotaMonto: (id: string, monto: number) => void;
  onSubmit: () => void | Promise<void>;
  canSubmit: boolean;
  isPending: boolean;
};

export function CuotasManualEditor({
  isManual,
  cuotas,
  adoptPreview,
  resetToPreview,
  editCuotaFecha,
  editCuotaMonto,
  onSubmit,
  canSubmit,
  isPending,
}: Props) {
  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-2 justify-end">
        {!isManual ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={adoptPreview}
          >
            Editar cuotas
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={resetToPreview}
            >
              Regenerar desde plan
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={onSubmit}
              disabled={!canSubmit || isPending}
            >
              {isPending ? (
                <>
                  <Spinner className="mr-1.5 h-3 w-3" />
                  Creando crédito…
                </>
              ) : (
                "Crear crédito"
              )}
            </Button>
          </>
        )}
      </div>

      {isManual && !!cuotas?.length && (
        <>
          {/* header */}
          <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-muted-foreground border-b pb-1">
            <div className="col-span-2">#</div>
            <div className="col-span-5">Fecha</div>
            <div className="col-span-5 text-right">Monto (Q)</div>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y">
            {cuotas.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-12 gap-2 py-1.5 items-center text-xs"
              >
                <div className="col-span-2 text-muted-foreground">
                  {c.numero}
                </div>
                <div className="col-span-5">
                  <Input
                    type="date"
                    className="h-7 text-xs"
                    value={dayjs(c.fechaISO).format("YYYY-MM-DD")}
                    onChange={(e) => editCuotaFecha(c.id, e.target.value)}
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    inputMode="decimal"
                    className="h-7 text-xs text-right"
                    value={String(c.monto)}
                    onChange={(e) =>
                      editCuotaMonto(c.id, Number(e.target.value || 0))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
