import { erpEndpoints } from "@/API/routes/endpoints";
import { cajasQkeys } from "./Qk";
import { erp } from "@/API/erpApi";
import { CajaConSaldo } from "@/utils/components/SelectMethodPayment/PurchasePaymentFormDialog";

export function useGetCajasDisponibles(sucursalId: number) {
  return erp.useQueryApi<CajaConSaldo[]>(
    cajasQkeys.cajas(sucursalId),
    erpEndpoints.cajas.disponibles(sucursalId),
    undefined,
    { enabled: !!sucursalId, staleTime: 30_000, refetchOnWindowFocus: false },
  );
}
