import { erp } from "@/API/erpApi";
import { useApiMutation } from "../genericoCall/genericoCallHook";
import { erpEndpoints } from "@/API/routes/endpoints";
import {
  QueryBalanceComprobacion,
  QueryEstadoBancario,
  QueryEstadoCajaTurno,
  QueryEstadoCuentaCliente,
  QueryEstadoCuentaContable,
  QueryEstadoCuentaProveedor,
  QueryEstadoResultados,
  QueryFlujoCaja,
  QueryLibroDiario,
  QueryLibroMayor,
  QueryMovimientosSinAsiento,
  QueryReporteGastos,
  QueryReporteReglasContables,
  QueryReporteVentas,
} from "@/Types/contabilidad/payload-excel-reports";

export interface UtilidadReportQuery {
  fechaInicio: Date | null;
  fechaFin: Date | null;
  comprobantes?: string[]; // era comprobante
  metodosPago?: string[]; // era metodoPago
  montoMin?: string;
  montoMax?: string;
}

export function useReportUtilidad() {
  return useApiMutation<Blob, UtilidadReportQuery>(
    "post",
    "excel-reports/utilidad-ventas",
    {
      responseType: "blob",
    },
  );
}

export function useReportVentas() {
  return useApiMutation<Blob, UtilidadReportQuery>(
    "post",
    "excel-reports/ventas",
    {
      responseType: "blob",
    },
  );
}

// CONTABILIDAD REPORTES EXCEL CON PARAMETROS Y PAYLOADS

export function useGetBalanceComprobacion() {
  return erp.useMutationApi<Blob, QueryBalanceComprobacion>(
    "post",
    erpEndpoints.excel.balance_comprobacion,
    {
      responseType: "blob",
    },
  );
}

// CONTABILIDAD REPORTES EXCEL CON PARAMETROS Y PAYLOADS
export function useGetLibroDiario() {
  return erp.useMutationApi<Blob, QueryLibroDiario>(
    "post",
    erpEndpoints.excel.libro_diario,
    {
      responseType: "blob",
    },
  );
}

export function useGetLibroMayor() {
  return erp.useMutationApi<Blob, QueryLibroMayor>(
    "post",
    erpEndpoints.excel.libro_mayor,
    {
      responseType: "blob",
    },
  );
}

export function useGetEstadoResultados() {
  return erp.useMutationApi<Blob, QueryEstadoResultados>(
    "post",
    erpEndpoints.excel.estado_resultados,
    {
      responseType: "blob",
    },
  );
}

export function useGetFlujoCaja() {
  return erp.useMutationApi<Blob, QueryFlujoCaja>(
    "post",
    erpEndpoints.excel.flujo_caja,
    {
      responseType: "blob",
    },
  );
}

export function useGetEstadoCajaTurno() {
  return erp.useMutationApi<Blob, QueryEstadoCajaTurno>(
    "post",
    erpEndpoints.excel.estado_caja_turno,
    {
      responseType: "blob",
    },
  );
}

export function useGetEstadoCuentaContable() {
  return erp.useMutationApi<Blob, QueryEstadoCuentaContable>(
    "post",
    erpEndpoints.excel.estado_cuenta_contable,
    {
      responseType: "blob",
    },
  );
}

export function useGetEstadoCuentaCliente() {
  return erp.useMutationApi<Blob, QueryEstadoCuentaCliente>(
    "post",
    erpEndpoints.excel.estado_cuenta_cliente,
    {
      responseType: "blob",
    },
  );
}

export function useGetEstadoCuentaProveedor() {
  return erp.useMutationApi<Blob, QueryEstadoCuentaProveedor>(
    "post",
    erpEndpoints.excel.estado_cuenta_proveedor,
    {
      responseType: "blob",
    },
  );
}

export function useGetReporteVentas() {
  return erp.useMutationApi<Blob, QueryReporteVentas>(
    "post",
    erpEndpoints.excel.ventas_reportes,
    {
      responseType: "blob",
    },
  );
}

export function useGetReporteGastos() {
  return erp.useMutationApi<Blob, QueryReporteGastos>(
    "post",
    erpEndpoints.excel.gastos,
    {
      responseType: "blob",
    },
  );
}

export function useGetReporteReglasContables() {
  return erp.useMutationApi<Blob, QueryReporteReglasContables>(
    "post",
    erpEndpoints.excel.reglas_contables,
    {
      responseType: "blob",
    },
  );
}

export function useGetMovimientosSinAsiento() {
  return erp.useMutationApi<Blob, QueryMovimientosSinAsiento>(
    "post",
    erpEndpoints.excel.movimientos_sin_asiento,
    {
      responseType: "blob",
    },
  );
}

export function useGetEstadoBancario() {
  return erp.useMutationApi<Blob, QueryEstadoBancario>(
    "post",
    erpEndpoints.excel.estado_bancario,
    {
      responseType: "blob",
    },
  );
}

export const downloadFile = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
