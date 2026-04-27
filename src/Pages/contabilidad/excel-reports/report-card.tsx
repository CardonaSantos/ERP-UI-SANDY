"use client";

import React from "react";
import { Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  children: React.ReactNode; // filtros
  onGenerate: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ReportCard({
  title,
  description,
  icon,
  badge,
  children,
  onGenerate,
  isLoading = false,
  className,
}: ReportCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card text-card-foreground",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            {icon}
          </span>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold leading-tight">{title}</h3>
              {badge && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Filtros */}
      <div className="flex flex-col gap-3 p-4">{children}</div>

      <Separator />

      {/* Acción */}
      <div className="flex items-center justify-end p-3">
        <Button
          size="sm"
          onClick={onGenerate}
          disabled={isLoading}
          className="gap-1.5 text-xs"
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          {isLoading ? "Generando..." : "Generar Excel"}
        </Button>
      </div>
    </article>
  );
}
