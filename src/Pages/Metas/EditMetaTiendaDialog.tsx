import { useStore } from "@/components/Context/ContextSucursal";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Edit, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { EstadoMetaSelect, EstadoMetaTienda, MetaTienda } from "./types";
import { useUpdateMetaTienda } from "@/hooks/metas-hook/useMetas";

interface EditMetaTiendaDialogProps {
  open: boolean;
  onClose: () => void;
  metaTienda: MetaTienda | null;
}

export function EditMetaTiendaDialog({
  open,
  onClose,
  metaTienda,
}: EditMetaTiendaDialogProps) {
  const [formData, setFormData] = useState<MetaTienda | null>(null);
  const userRol = useStore((state) => state.userRol);

  const updateMeta = useUpdateMetaTienda();

  useEffect(() => {
    if (metaTienda) setFormData({ ...metaTienda });
  }, [metaTienda]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) =>
      prev
        ? { ...prev, [name]: name.includes("monto") ? Number(value) : value }
        : null
    );
  };

  const handleSave = () => {
    if (!formData) return;

    toast.promise(
      updateMeta.mutateAsync({
        id: formData.id,
        payload: {
          tituloMeta: formData.tituloMeta,
          estado: formData.estado,
          montoMeta: formData.montoMeta,
          montoActual: formData.montoActual,
        },
      }),
      {
        loading: "Actualizando meta...",
        success: "Meta actualizada correctamente",
        error: "Error al actualizar la meta",
      }
    );

    onClose();
  };

  const handleChangeEstado = (estado: EstadoMetaTienda) => {
    setFormData((prev) => (prev ? { ...prev, estado } : null));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-lg font-semibold">
            <Edit className="h-5 w-5 text-primary" />
            Editar Meta de Tienda
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              name="tituloMeta"
              value={formData?.tituloMeta || ""}
              onChange={handleInputChange}
              placeholder="Título de la meta"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Monto meta</label>
            <Input
              name="montoMeta"
              type="number"
              value={formData?.montoMeta ?? ""}
              onChange={handleInputChange}
              placeholder="Monto objetivo"
            />
          </div>

          {userRol === "ADMIN" && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Monto actual</label>
              <Input
                name="montoActual"
                type="number"
                value={formData?.montoActual ?? ""}
                onChange={handleInputChange}
                placeholder="Monto actual"
              />
            </div>
          )}

          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={formData?.estado} onValueChange={handleChangeEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EstadoMetaSelect).map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Check className="mr-2 h-4 w-4" />
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
