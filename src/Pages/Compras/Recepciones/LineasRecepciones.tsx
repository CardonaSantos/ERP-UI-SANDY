"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Box,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  PackageOpen,
  Tag,
  UserRound,
} from "lucide-react";
import type { RecepcionParcialUI } from "./interfaces/recepcionesInterfaces";

// ---- stub formatters ----
const fmt = (d?: string) =>
  d
    ? new Date(d).toLocaleString("es-GT", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("es-GT", { dateStyle: "short" }) : "—";
const fmtM = (n?: number) =>
  n != null
    ? `Q${Number(n).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`
    : "—";

interface Props {
  lineas: RecepcionParcialUI[];
}

export default function LineasRecepciones({ lineas }: Props) {
  const recepciones = Array.isArray(lineas) ? lineas : [];

  if (recepciones.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-6 text-xs text-muted-foreground">
        <PackageOpen className="h-4 w-4 shrink-0" />
        <span>No hay recepciones registradas.</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-xs font-medium">Recepciones parciales</span>
        <span className="text-xs text-muted-foreground">
          {recepciones.length} registradas
        </span>
      </div>

      <Separator />

      <div className="divide-y">
        {recepciones.map((r) => {
          const ordenadas = r.lineas.reduce(
            (a, l) => a + (l.cantidadOrdenada ?? 0),
            0,
          );
          const recibidas = r.totales.unidadesRecibidas ?? 0;
          const pct =
            ordenadas > 0
              ? Math.min(100, Math.round((recibidas / ordenadas) * 100))
              : 0;

          return (
            <div key={r.recepcionId}>
              {/* Recepción header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className="h-5 gap-1 px-1.5 text-xs"
                  >
                    <ClipboardList className="h-3 w-3" />#{r.recepcionId}
                  </Badge>
                  <Badge variant="outline" className="h-5 gap-1 px-1.5 text-xs">
                    <CalendarDays className="h-3 w-3" />
                    {fmt(r.fecha)}
                  </Badge>
                  <Badge variant="outline" className="h-5 gap-1 px-1.5 text-xs">
                    <UserRound className="h-3 w-3" />
                    {r.usuario?.nombre ?? "—"}
                  </Badge>
                  <Badge variant="outline" className="h-5 gap-1 px-1.5 text-xs">
                    <PackageOpen className="h-3 w-3" />
                    {r.totales.lineas} líneas
                  </Badge>
                  <Badge variant="default" className="h-5 gap-1 px-1.5 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {recibidas} unid.
                  </Badge>
                  {r.observaciones && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 shrink-0" />
                      {r.observaciones}
                    </span>
                  )}
                </div>

                {/* Mini progress */}
                <div className="flex w-32 shrink-0 items-center gap-2">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="w-8 text-right text-[10px] text-muted-foreground">
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Líneas table */}
              <div className="px-4 pb-3">
                <table
                  className="w-full text-xs"
                  aria-label={`Líneas recepción #${r.recepcionId}`}
                >
                  <thead>
                    <tr className="border-b text-[10px] text-muted-foreground">
                      <th className="pb-1 pr-3 text-left font-medium">
                        Artículo
                      </th>
                      <th className="pb-1 px-2 text-right font-medium">
                        Ordenado
                      </th>
                      <th className="pb-1 px-2 text-right font-medium">
                        Recibido
                      </th>
                      <th className="pb-1 px-2 text-right font-medium">
                        Pendiente
                      </th>
                      <th className="pb-1 px-2 text-right font-medium">
                        Costo U.
                      </th>
                      <th className="pb-1 pl-2 text-right font-medium">
                        Vence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {r.lineas.map((l) => {
                      const pendiente = Math.max(
                        0,
                        (l.cantidadOrdenada ?? 0) - (l.cantidadRecibida ?? 0),
                      );
                      return (
                        <tr key={l.lineaId} className="align-middle">
                          {/* Item */}
                          <td className="py-1.5 pr-3">
                            <div className="flex items-center gap-2">
                              <ItemThumb
                                src={l.item?.imagenUrl}
                                alt={l.item?.nombre}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate font-medium">
                                    {l.item?.nombre ?? "—"}
                                  </span>
                                  {l.item?.itemTipo && (
                                    <Badge
                                      variant="secondary"
                                      className="h-4 px-1 text-[9px]"
                                    >
                                      {l.item.itemTipo}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Tag className="h-2.5 w-2.5" />
                                  <span className="truncate">
                                    {l.item?.codigo ?? "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Qty columns */}
                          <td className="px-2 text-right tabular-nums">
                            {l.cantidadOrdenada ?? "—"}
                          </td>
                          <td className="px-2 text-right tabular-nums">
                            {l.cantidadRecibida ?? "—"}
                          </td>
                          <td className="px-2 text-right tabular-nums">
                            {pendiente > 0 ? (
                              <span className="font-medium text-amber-600 dark:text-amber-400">
                                {pendiente}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                          <td className="px-2 text-right tabular-nums">
                            {fmtM(l.costoUnitario)}
                          </td>
                          <td className="pl-2 text-right tabular-nums text-muted-foreground">
                            {fmtDate(
                              l.fechaExpiracion ?? new Date().toISOString(),
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */

function ItemThumb({ src, alt }: { src?: string | null; alt?: string | null }) {
  if (!src) {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded border bg-muted/40"
        aria-hidden="true"
      >
        <Box className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="h-7 w-7 shrink-0 overflow-hidden rounded border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? "Artículo"}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
