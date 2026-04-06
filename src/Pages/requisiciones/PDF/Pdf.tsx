"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import currency from "currency.js";
import { formattFecha } from "@/Pages/Utils/Utils";
import { formateDateWithMinutes } from "@/Crm/Utils/FormateDate";
import { useGetOneRequisicion } from "@/hooks/use-requisiciones/use-requisiciones";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatearMoneda = (
  value: string | number,
  decimales = 2,
): string => {
  return currency(value, {
    precision: decimales,
    symbol: "Q ",
    separator: ",",
    decimal: ".",
    pattern: "!#",
  }).format();
};

const RequisicionPDF = () => {
  const { id } = useParams();

  // 1. Usamos el hook directamente aquí (Top-level)
  // React Query se encarga de isFetching (isLoading), isError y la data.
  const {
    data: requisicion,
    isFetching: isLoading,
    isError,
  } = useGetOneRequisicion(Number(id));

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const requisicionRef = useRef<HTMLDivElement>(null);

  // 2. Eliminamos el useEffect que hacía el fetch.
  // Solo conservamos el useEffect que genera el PDF cuando la "requisicion" ya existe.
  useEffect(() => {
    if (!requisicion || !requisicionRef.current) return;

    const generarPDF = async () => {
      try {
        const canvas = await html2canvas(requisicionRef.current!, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ unit: "mm", format: "a4" });
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        const blob = pdf.output("blob");
        setPdfUrl(URL.createObjectURL(blob));
      } catch (error) {
        console.error("Error al generar PDF:", error);
      }
    };

    generarPDF();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // Dependemos de la data que retorna el hook
  }, [requisicion]);

  // 3. Manejo de estados de carga y error simplificados
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center">Cargando requisición...</p>
      </div>
    );
  }

  if (isError || !requisicion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-red-600">
          Error al cargar o requisición no encontrada
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100">
      <div
        ref={requisicionRef}
        className={`${pdfUrl ? "hidden" : "block"} mx-auto bg-white shadow-xl rounded-lg`}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "28px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-4 mb-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Requisición de Productos
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Documento generado automáticamente
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase">Folio</p>
            <p className="text-sm font-semibold">{requisicion.folio}</p>
          </div>
        </div>

        {/* INFO PRINCIPAL */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="space-y-1">
            <p>
              <span className="text-gray-500">Fecha:</span>{" "}
              {formateDateWithMinutes(requisicion.fecha)}
            </p>
            <p>
              <span className="text-gray-500">Actualizado:</span>{" "}
              {formateDateWithMinutes(requisicion.updatedAt)}
            </p>
            <p>
              <span className="text-gray-500">Sucursal:</span>{" "}
              {requisicion.sucursal.nombre}
            </p>
            <p>
              <span className="text-gray-500">Solicitante:</span>{" "}
              {requisicion.usuario.nombre}
            </p>
          </div>

          <div className="space-y-1 text-right">
            <p>
              <span className="text-gray-500">Total líneas:</span>{" "}
              {requisicion.totalLineas}
            </p>
            <p className="font-medium">
              <span className="text-gray-500">Total estimado:</span>{" "}
              {formatearMoneda(requisicion.totalRequisicion)}
            </p>
          </div>
        </div>

        {/* OBSERVACIONES */}
        {requisicion.observaciones && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Observaciones</h3>
            <div className="border rounded-md p-3 text-sm text-gray-700 bg-gray-50">
              {requisicion.observaciones}
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Detalle de productos</h3>

          <table className="w-full text-xs border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-2 py-2 text-left">Código</th>
                <th className="px-2 py-2 text-left">Producto</th>
                <th className="px-2 py-2 text-center">Stock</th>
                <th className="px-2 py-2 text-center">Mín</th>
                <th className="px-2 py-2 text-center">Sug.</th>
                <th className="px-2 py-2 text-center">Rec.</th>
                <th className="px-2 py-2 text-right">Exp.</th>
                <th className="px-2 py-2 text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {requisicion.lineas.map((linea, i) => (
                <tr
                  key={linea.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-2 py-2 font-mono">
                    {linea.producto.codigoProducto}
                  </td>
                  <td className="px-2 py-2">{linea.producto.nombre}</td>
                  <td className="px-2 py-2 text-center">
                    {linea.cantidadActual}
                  </td>
                  <td className="px-2 py-2 text-center">{linea.stockMinimo}</td>
                  <td className="px-2 py-2 text-center font-medium">
                    {linea.cantidadSugerida}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {linea.cantidadRecibida ?? "—"}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {linea.fechaExpiracion
                      ? formattFecha(linea.fechaExpiracion)
                      : "—"}
                  </td>
                  <td className="px-2 py-2 text-right font-medium">
                    {formatearMoneda(
                      linea.precioUnitario * linea.cantidadSugerida,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end">
          <div className="w-72 border rounded-md text-sm">
            <div className="flex justify-between px-3 py-2 border-b">
              <span className="text-gray-500">Productos</span>
              <span>{requisicion.totalLineas}</span>
            </div>

            <div className="flex justify-between px-3 py-2 border-b">
              <span className="text-gray-500">Unidades</span>
              <span>
                {requisicion.lineas.reduce(
                  (acc, l) => acc + l.cantidadSugerida,
                  0,
                )}
              </span>
            </div>

            <div className="flex justify-between px-3 py-3 font-semibold text-base bg-gray-100">
              <span>Total</span>
              <span>{formatearMoneda(requisicion.totalRequisicion)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PDF preview */}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          className="w-full h-[80vh] mt-6 border rounded-lg"
        />
      )}
    </div>
  );
};

export default RequisicionPDF;
