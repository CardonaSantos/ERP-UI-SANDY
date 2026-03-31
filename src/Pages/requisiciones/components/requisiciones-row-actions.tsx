"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Eye,
  Printer,
  ShoppingCart,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  getReqFlags,
  RequisitionResponseDTO,
} from "@/Types/requisicion-interfaces/interfaces";
import { Link } from "react-router-dom";

// ============================================================
// Props
// ============================================================

interface RequisitionRowActionsProps {
  requisicion: RequisitionResponseDTO;
  onVerDetalle: (req: RequisitionResponseDTO) => void;
  onImprimir: (req: RequisitionResponseDTO) => void;
  onSendToCompras: (req: RequisitionResponseDTO) => void;
  // onDelete?: (row: TData) => void;
}

// ============================================================
// Component
// ============================================================

export function RequisitionRowActions({
  requisicion,
  onVerDetalle,
  onImprimir,
  onSendToCompras,
}: RequisitionRowActionsProps) {
  const { canEdit, canSendToCompras, isEnviadaCompras } =
    getReqFlags(requisicion);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Abrir menú de acciones"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {/* ── Ver detalle ─────────────────────────────────── */}
        <DropdownMenuItem onClick={() => onVerDetalle(requisicion)}>
          <Eye className="h-4 w-4 mr-2" />
          Ver detalle
        </DropdownMenuItem>

        {/* ── Imprimir ────────────────────────────────────── */}
        <DropdownMenuItem onClick={() => onImprimir(requisicion)}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ── Editar (navega a ruta dedicada) ─────────────── */}
        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link to={`/requisicion-edit/${requisicion.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar registro
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>
            <Pencil className="h-4 w-4 mr-2" />
            Editar registro
          </DropdownMenuItem>
        )}

        {/* ── Enviar a compras ────────────────────────────── */}
        <DropdownMenuItem
          disabled={!canSendToCompras || isEnviadaCompras}
          onClick={() => canSendToCompras && onSendToCompras(requisicion)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isEnviadaCompras ? "Ya en compras" : "Enviar a compras"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ── Eliminar ────────────────────────────────────── */}
        {/* <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(requisicion)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
