"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export function DescriptionForm({ value, onChange }: Props) {
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium">Descripción</h3>
        <p className="text-xs text-muted-foreground">
          Información detallada del producto
        </p>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="space-y-1">
          <Label htmlFor="descripcion" className="text-xs">
            Descripción
          </Label>
          <div className="relative">
            <Textarea
              id="descripcion"
              rows={4}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Describa el producto"
              className="text-sm resize-none pr-8"
            />
            <FileText className="absolute right-2 top-2 text-muted-foreground h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
