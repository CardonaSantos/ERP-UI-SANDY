import { erp } from "@/API/erpApi";
import { UICreditoCompra } from "@/Pages/Compras/Credito/creditoCompraDisponible/interfaces/interfaces";
import { creditQkeys } from "./Qk";
import { erpEndpoints } from "@/API/routes/endpoints";
import { CompraRecepcionableResponse } from "@/Pages/Compras/ResumenRecepcionParcial/Interfaces/detalleRecepcionable";
import { comprasQkeys } from "../use-compras/Qk";

export function useGetCreditoCompra(compraId: number) {
  return erp.useQueryApi<UICreditoCompra>(
    creditQkeys.fromCompra(compraId),
    erpEndpoints.creditos.documento_compra(compraId),
    undefined,
    { staleTime: 0, refetchOnWindowFocus: false },
  );
}

export function useGetCompraRecepcionable(compraId: number) {
  return erp.useQueryApi<CompraRecepcionableResponse>(
    comprasQkeys.recepcionable(compraId),
    erpEndpoints.compras.recepcionable,
    { params: { compraId } },
  );
}
