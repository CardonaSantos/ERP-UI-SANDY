// api/compras.ts
import type { GetRegistrosComprasQuery } from "./interfaceQuery";
import { cleanParams } from "@/utils/utilsCleans";
import { http } from "@/utils/http";
import axios from "axios";
import {
  CompraRegistroUI,
  PaginatedComprasResponse,
} from "@/Types/compras/interfaces";
const API_URL = import.meta.env.VITE_API_URL;

// const ENDPOINT = `/compras/get-registros-compras-con-detalle`;
export async function getRegistrosComprasConDetalle(
  query: GetRegistrosComprasQuery,
): Promise<PaginatedComprasResponse> {
  const params = cleanParams({ withDetalles: true, ...query });
  const { data } = await http.get<PaginatedComprasResponse>(
    `${API_URL}/compra-requisicion/get-registros-compras-con-detalle`,
    {
      params,
    },
  );
  return data;
}

export async function getRegistroCompra(id: number): Promise<CompraRegistroUI> {
  const { data } = await axios.get<CompraRegistroUI>(
    `${API_URL}/compra-requisicion/get-registro/${id}`,
  );
  return data;
}

export async function recepcionarCompraAuto(params: {
  compraId: number;
  usuarioId: number;
  proveedorId: number;
  observaciones?: string;
  metodoPago: string;
  cuentaBancariaId?: number;
}) {
  const { data } = await axios.post(
    `${API_URL}/compra-requisicion/${params.compraId}/recepcionar`,
    {
      usuarioId: params.usuarioId,
      observaciones: params.observaciones,
      proveedorId: params.proveedorId,
      compraId: params.compraId,
      metodoPago: params.metodoPago,
      cuentaBancariaId: params.cuentaBancariaId,
    },
  );
  return data;
}

export async function getProveedores() {
  const { data } = await axios.get(`${API_URL}/proveedor`);
  return data;
}

export async function getCuentasBancariasArrray() {
  const { data } = await axios.get(
    `${API_URL}/cuentas-bancarias/get-simple-select`,
  );
  return data;
}

export async function getCajasAbiertas(sucursalId: number) {
  const { data } = await axios.get(
    `${API_URL}/caja/cajas-disponibles/${sucursalId}`,
  );
  return data;
}
