import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Printer, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCuotaComprobante } from "@/hooks/use-comprobante-cuota/use-comprobante-cuota";
import logo from "@/assets/NOVAPOSPNG.png";

function Fila({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!value && value !== 0) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "3px 0",
        borderBottom: "1px dashed #e5e7eb",
      }}
    >
      <span style={{ fontSize: "9pt", color: "#6b7280" }}>{label}</span>
      <span
        style={{
          fontSize: "9pt",
          fontWeight: 500,
          textAlign: "right",
          marginLeft: "16px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <p
        style={{
          fontSize: "8pt",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#9ca3af",
          marginBottom: "4px",
        }}
      >
        {titulo}
      </p>
      <div
        style={{
          background: "#f9fafb",
          borderRadius: "4px",
          padding: "8px 12px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Componente puro que se imprime — sin clases Tailwind para evitar conflictos
function TicketContent({
  data,
}: {
  data: NonNullable<ReturnType<typeof useCuotaComprobante>["data"]>;
}) {
  const { abono, cliente, credito, sucursal } = data;

  return (
    <div
      style={{
        width: "9cm",
        margin: "0 auto",
        padding: "1cm",
        background: "white",
        color: "black",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Logo + cabecera */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "60px",
            height: "60px",
            objectFit: "contain",
            margin: "0 auto 8px",
          }}
        />
        <p style={{ fontSize: "11pt", fontWeight: "bold", margin: 0 }}>
          {sucursal?.nombre ?? "—"}
        </p>
        {sucursal?.direccion && (
          <p style={{ fontSize: "8pt", color: "#6b7280", margin: "2px 0 0" }}>
            {sucursal.direccion}
          </p>
        )}
        {sucursal?.telefono && (
          <p style={{ fontSize: "8pt", color: "#6b7280", margin: "2px 0 0" }}>
            Tel. {sucursal.telefono}
          </p>
        )}
      </div>

      {/* Título */}
      <div
        style={{
          textAlign: "center",
          borderTop: "1px solid black",
          borderBottom: "1px solid black",
          padding: "4px 0",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontSize: "10pt",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          Comprobante de Pago
        </p>
        <p style={{ fontSize: "8pt", color: "#6b7280", margin: "2px 0 0" }}>
          Cuota {data.numeroCuota} de {data.totalCuotas}
        </p>
      </div>

      {/* Cliente */}
      <Seccion titulo="Cliente">
        <Fila label="Nombre" value={cliente.nombreCompleto} />
        <Fila label="DPI" value={cliente.dpi} />
        <Fila label="Teléfono" value={cliente.telefono} />
      </Seccion>

      {/* Crédito */}
      <Seccion titulo="Crédito">
        <Fila label="N° crédito" value={credito.numeroCredito} />
        <Fila
          label="Monto total"
          value={`Q ${Number(credito.montoTotalConInteres).toFixed(2)}`}
        />
        <Fila
          label="Total pagado"
          value={`Q ${Number(credito.totalPagado).toFixed(2)}`}
        />
      </Seccion>

      {/* Detalle del pago */}
      {abono && (
        <Seccion titulo="Detalle del pago">
          <Fila
            label="Fecha"
            value={new Date(abono.fecha).toLocaleDateString("es-GT")}
          />
          <Fila label="Método" value={abono.metodoPago} />
          {abono.referenciaPago && (
            <Fila label="Referencia" value={abono.referenciaPago} />
          )}
          <Fila
            label="Capital"
            value={`Q ${Number(abono.montoCapital).toFixed(2)}`}
          />
          <Fila
            label="Interés"
            value={`Q ${Number(abono.montoInteres).toFixed(2)}`}
          />
          {Number(abono.montoMora) > 0 && (
            <Fila
              label="Mora"
              value={`Q ${Number(abono.montoMora).toFixed(2)}`}
            />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid #d1d5db",
            }}
          >
            <span style={{ fontSize: "10pt", fontWeight: "bold" }}>
              TOTAL PAGADO
            </span>
            <span style={{ fontSize: "10pt", fontWeight: "bold" }}>
              Q {Number(abono.montoTotal).toFixed(2)}
            </span>
          </div>
        </Seccion>
      )}

      {/* Estado cuota */}
      <Seccion titulo="Estado cuota">
        <Fila
          label="Vencimiento"
          value={
            data.fechaVencimiento
              ? new Date(data.fechaVencimiento).toLocaleDateString("es-GT")
              : "—"
          }
        />
        <Fila label="Estado" value={data.estadoCuota} />
        {Number(data.moraAcumulada) > 0 && (
          <Fila
            label="Mora acumulada"
            value={`Q ${Number(data.moraAcumulada).toFixed(2)}`}
          />
        )}
        {abono?.cobradoPor && (
          <Fila label="Cobrado por" value={abono.cobradoPor} />
        )}
      </Seccion>

      {/* Pie */}
      <div
        style={{
          textAlign: "center",
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid #d1d5db",
        }}
      >
        <p style={{ fontSize: "8pt", color: "#9ca3af", margin: 0 }}>
          Emitido el {new Date().toLocaleDateString("es-GT")} a las{" "}
          {new Date().toLocaleTimeString("es-GT", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p style={{ fontSize: "7pt", color: "#9ca3af", marginTop: "4px" }}>
          Conserve este comprobante
        </p>
      </div>
    </div>
  );
}

export function ComprobanteCuota() {
  const { cuotaId } = useParams();
  const { data, isLoading, isError } = useCuotaComprobante(Number(cuotaId));
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Comprobante-Cuota-${cuotaId}`,
    pageStyle: `
      @page {
        size: 9cm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        background: white;
      }
    `,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-xs">Generando comprobante...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-xs text-muted-foreground">
            No se pudo cargar el comprobante.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra acción */}
      <div className="flex justify-end gap-3 px-4 pt-4 pb-2">
        <Button
          size="sm"
          className="gap-2 h-8 text-xs"
          onClick={() => handlePrint()}
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Preview */}
      <div className="flex justify-center p-4">
        <div className="shadow-xl rounded bg-white">
          <div ref={printRef}>
            <TicketContent data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComprobanteCuota;
