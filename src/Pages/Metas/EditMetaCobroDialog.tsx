import { useEffect, useState } from "react";
import { EstadoMetaCobro, EstadoMetaSelect, MetaCobros } from "./types";
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
import { useUpdateMetaCobro } from "@/hooks/metas-hook/useMetas";

interface EditMetaCobroProps {
  open: boolean;
  onClose: () => void;
  metaCobro: MetaCobros | null;
}

export function EditMetaCobroDialog({
  open,
  onClose,
  metaCobro,
}: EditMetaCobroProps) {
  const [formData, setFormData] = useState<MetaCobros | null>(null);
  const updateMeta = useUpdateMetaCobro();

  useEffect(() => {
    if (metaCobro) setFormData({ ...metaCobro });
  }, [metaCobro]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    try {
      if (!formData) return;

      toast.promise(
        updateMeta.mutateAsync({
          id: formData.id,
          payload: {
            tituloMeta: formData.tituloMeta,
            estado: formData.estado,
            montoMeta: Number(formData.montoMeta),
          },
        }),
        {
          loading: "Actualizando meta...",
          success: "Meta actualizada",
          error: "Error al actualizar",
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-lg font-semibold">
            <Edit className="h-5 w-5 text-blue-500" />
            Editar Meta de Cobros
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Título de la meta
            </label>
            <Input
              name="tituloMeta"
              value={formData?.tituloMeta ?? ""}
              onChange={handleInputChange}
              placeholder="Título de la meta"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Monto meta
            </label>
            <Input
              name="montoMeta"
              type="number"
              value={formData?.montoMeta ?? ""}
              onChange={handleInputChange}
              placeholder="Monto objetivo"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Estado
            </label>
            <Select
              value={formData?.estado}
              onValueChange={(v: EstadoMetaCobro) =>
                setFormData((prev) => (prev ? { ...prev, estado: v } : prev))
              }
            >
              <SelectTrigger className="w-full">
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

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
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
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
