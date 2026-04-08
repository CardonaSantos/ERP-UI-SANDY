"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, X, Plus, Hash } from "lucide-react";
import { PrecioProducto } from "../interfaces/DomainProdPressTypes";
import { RolPrecio } from "@/Pages/InventarioYStock/interfaces/InventaryInterfaces";

interface Props {
  precios: PrecioProducto[];
  setPrecios: (precios: PrecioProducto[]) => void;
}

const ROLES: { label: string; value: RolPrecio }[] = [
  { label: "Público", value: RolPrecio.PUBLICO },
  { label: "Agroservicio", value: RolPrecio.AGROSERVICIO },
  { label: "Finca", value: RolPrecio.FINCA },
  { label: "Distribuidor", value: RolPrecio.DISTRIBUIDOR },
  { label: "Promoción", value: RolPrecio.PROMOCION },
];

export function PricesForm({ precios, setPrecios }: Props) {
  const updateField = <K extends keyof PrecioProducto>(
    idx: number,
    key: K,
    value: PrecioProducto[K],
  ) => {
    const next = precios.map((item, i) =>
      i === idx ? { ...item, [key]: value } : item,
    );
    setPrecios(next);
  };

  const addPrecio = () => {
    setPrecios([
      ...precios,
      { precio: "", orden: precios.length + 1, rol: RolPrecio.PUBLICO },
    ]);
  };

  const removePrecio = (idx: number) => {
    setPrecios(precios.filter((_, i) => i !== idx));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium">Precios</h3>
        <p className="text-xs text-muted-foreground">
          Configure los precios por rol de cliente
        </p>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="space-y-2">
          {precios.length > 0 && (
            <div className="grid grid-cols-12 gap-2 pb-1">
              <Label className="col-span-5 text-xs text-muted-foreground">
                Precio
              </Label>
              <Label className="col-span-2 text-xs text-muted-foreground">
                Orden
              </Label>
              <Label className="col-span-4 text-xs text-muted-foreground">
                Rol
              </Label>
            </div>
          )}

          {precios.map((p, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5 relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={p.precio}
                  onChange={(e) => updateField(idx, "precio", e.target.value)}
                  placeholder="0.00"
                  className="text-sm pl-7"
                />
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-3 w-3" />
              </div>

              <div className="col-span-2 relative">
                <Input
                  type="number"
                  value={p.orden}
                  onChange={(e) =>
                    updateField(idx, "orden", Number(e.target.value) || 0)
                  }
                  placeholder="1"
                  className="text-sm pl-6"
                />
                <Hash className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-3 w-3" />
              </div>

              <div className="col-span-4">
                <Select
                  value={p.rol}
                  onValueChange={(v) => updateField(idx, "rol", v as RolPrecio)}
                >
                  <SelectTrigger className="w-full text-sm h-9">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem
                        key={r.value}
                        value={r.value}
                        className="text-sm"
                      >
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePrecio(idx)}
                  aria-label="Eliminar precio"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full border-dashed text-xs h-8"
            onClick={addPrecio}
            type="button"
          >
            <Plus className="h-3 w-3 mr-1" /> Agregar precio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
