import { useApiMutation } from "../genericoCall/genericoCallHook";

export interface UtilidadReportQuery {
  fechaInicio: Date | null;

  fechaFin: Date | null;

  comprobante?: string[];

  metodoPago?: string[];

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
