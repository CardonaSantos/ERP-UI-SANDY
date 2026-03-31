"use client";

/**
 * RequisicionesPage
 * ─────────────────────────────────────────────────────────────────────────────
 * Contenedor de nivel superior del módulo de Requisiciones.
 *
 * RESPONSABILIDADES DE ESTE NIVEL:
 *  • Todas las queries (useApiQuery)
 *  • Todas las mutaciones (useApiMutation)
 *  • Handlers que orquestan mutación + refetch + toast
 *  • Proveer los datos como props "planas" al componente de presentación
 *
 * NADA de estado de UI ni JSX de tabla vive aquí.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useMemo } from "react";
import { toast } from "sonner";

// ── Hooks de infraestructura ──────────────────────────────────────────────────
// Reemplaza estas rutas con las reales de tu proyecto
import {
  useApiQuery,
  useApiMutation,
} from "@/hooks/genericoCall/genericoCallHook";
import { useStore } from "@/components/Context/ContextSucursal";
import { useProveedoresSelect } from "@/hooks/getProveedoresSelect/proveedores";
import {
  RequisitionResponseDTO,
  SendToComprasDTO,
} from "@/Types/requisicion-interfaces/interfaces";
import { PartidaPresupuestal, ProveedorOption } from "./send-to-purchase";
import { RequisitionsTable } from "./requisiciones-table";

// ── Tipos ─────────────────────────────────────────────────────────────────────

// ── Utilidades ────────────────────────────────────────────────────────────────
// Reemplaza con los reales de tu proyecto
const getApiErrorMessageAxios = (err: unknown): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ??
  (err as { message?: string })?.message ??
  "Error desconocido";

// ============================================================
// Tipos del DTO de mutación extendido con partida
// ============================================================

type SendToComprasExtDTO = SendToComprasDTO & {
  partidaPresupuestalId: string;
};

// ============================================================
// Partidas mock — reemplaza con tu query real cuando exista
// ============================================================

const PARTIDAS_MOCK: PartidaPresupuestal[] = [
  {
    id: "PP-001",
    nombre: "Compras generales de insumos",
    codigoContable: "6.1.01",
    saldoDisponible: 50000,
  },
  {
    id: "PP-002",
    nombre: "Mantenimiento y reparaciones",
    codigoContable: "6.1.02",
    saldoDisponible: 12000,
  },
  {
    id: "PP-003",
    nombre: "Equipo y maquinaria",
    codigoContable: "6.1.03",
    saldoDisponible: 80000,
  },
];

// ============================================================
// Component
// ============================================================

export function RequisicionesPage() {
  const userId = useStore((s) => s.userId) ?? 0;

  // ────────────────────────────────────────────────────────────
  // QUERIES
  // ────────────────────────────────────────────────────────────

  /**
   * Query: lista de requisiciones
   */
  const {
    data: requisiciones = [],
    isFetching: isLoadingRequisiciones,
    isError: isErrorRequisiciones,
    error: errorRequisiciones,
    refetch: refetchRequisiciones,
  } = useApiQuery<RequisitionResponseDTO[]>(
    ["requisiciones-registros"],
    "requisicion",
    undefined,
    {
      initialData: [],
      refetchOnMount: "always",
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      staleTime: 10_000,
    },
  );

  /**
   * Query: proveedores para el select del diálogo "Enviar a compras"
   */
  const { data: proveedoresRaw = [] } = useProveedoresSelect();

  const proveedores: ProveedorOption[] = useMemo(
    () =>
      (proveedoresRaw ?? []).map((p) => ({
        id: p.id,
        nombre: p.nombre,
        telefonoContacto: p.telefonoContacto,
      })),
    [proveedoresRaw],
  );

  // Partidas presupuestales — swap PARTIDAS_MOCK por tu query cuando esté lista
  // const { data: partidas = PARTIDAS_MOCK } = useApiQuery<PartidaPresupuestal[]>(
  //   ["partidas-presupuestales"],
  //   "presupuesto/partidas",
  // );
  const partidas: PartidaPresupuestal[] = PARTIDAS_MOCK;

  // ────────────────────────────────────────────────────────────
  // MUTACIONES
  // ────────────────────────────────────────────────────────────

  /**
   * Mutación: enviar requisición al módulo de compras.
   * El path es estático porque el ID viaja en el body (dto.requisicionID).
   */
  const mutationSendToCompras = useApiMutation<void, SendToComprasExtDTO>(
    "post",
    "compra-requisicion/generar-compra",
    undefined,
    {
      onSuccess: () => {
        refetchRequisiciones();
      },
    },
  );

  /**
   * Mutación: eliminar requisición.
   * El path se construye en el handler con el ID concreto.
   * Como useApiMutation recibe el path al momento de la llamada,
   * usamos una variable mutable solo para el endpoint dinámico.
   *
   * Patrón recomendado: si tu hook soporta un path factory, úsalo;
   * de lo contrario declara el hook fuera y pasa el id en el body / params.
   *
   * Aquí mostramos el patrón con hook estático y path sobreescribible.
   */
  const mutationDeleteRequisicion = useApiMutation<void, void>(
    "delete",
    "requisicion/0", // path base; el handler lo reemplaza vía la opción dinámica del hook
    {},
  );

  // ────────────────────────────────────────────────────────────
  // HANDLERS
  // ────────────────────────────────────────────────────────────

  /**
   * Enviar a módulo de compras + comprometer saldo presupuestal
   */
  const handleSendToCompras = async (dto: SendToComprasExtDTO) => {
    if (
      !dto.requisicionID ||
      !dto.userID ||
      !dto.proveedorId ||
      !dto.partidaPresupuestalId
    ) {
      toast.warning("Faltan datos para el envío");
      return;
    }

    await toast.promise(mutationSendToCompras.mutateAsync(dto), {
      loading: "Enviando a módulo de compras...",
      success: "Requisición enviada y saldo comprometido correctamente",
      error: (err) => getApiErrorMessageAxios(err),
    });
  };

  /**
   * Eliminar requisición
   */
  const handleDeleteRequisicion = async (id: number) => {
    if (!id) {
      toast.warning("ID de requisición inválido");
      return;
    }

    // Adapta esta llamada según cómo tu hook soporte paths dinámicos.
    // Opción A: si el hook acepta override de path en el payload → pásalo
    // Opción B: si usas un hook con path factory → llámalo con el id
    // Opción C (la más común): declara un segundo hook `useApiMutation("delete", \`requisicion/${id}\`)`
    //          dentro del componente hijo que lo necesita (pasando el id como prop).
    await toast.promise(
      mutationDeleteRequisicion.mutateAsync(undefined as unknown as void),
      {
        loading: "Eliminando requisición...",
        success: "Requisición eliminada correctamente",
        error: (err) => getApiErrorMessageAxios(err),
      },
    );

    await refetchRequisiciones();
  };

  // ────────────────────────────────────────────────────────────
  // RENDER — delega toda la UI a RequisitionsTable
  // ────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Encabezado de página (opcional, personaliza según tu layout) */}
      <div>
        <h1 className="text-base font-semibold">Requisiciones</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gestión y seguimiento de requisiciones de compra
        </p>
      </div>

      <RequisitionsTable
        // ── Data ────────────────────────────────────────────
        data={requisiciones}
        isLoading={isLoadingRequisiciones}
        isError={isErrorRequisiciones}
        error={errorRequisiciones}
        onRefetch={refetchRequisiciones}
        // ── Selects ─────────────────────────────────────────
        proveedores={proveedores}
        partidas={partidas}
        // ── Estado de mutaciones ─────────────────────────────
        isSendingToCompras={mutationSendToCompras.isPending}
        isDeletingRequisicion={mutationDeleteRequisicion.isPending}
        // ── Callbacks ───────────────────────────────────────
        onSendToCompras={handleSendToCompras}
        onDeleteRequisicion={handleDeleteRequisicion}
      />
    </div>
  );
}

export default RequisicionesPage;
