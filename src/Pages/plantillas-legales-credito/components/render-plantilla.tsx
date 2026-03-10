import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Printer, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContratoRender } from "@/hooks/use-render-plantilla/use-render";

const CONTRATO_STYLES = `
  body { font-family: Arial, sans-serif; }

  .contrato-content h1 {
    font-size: 16pt; font-weight: bold;
    text-align: center; margin-bottom: 18px;
  }
  .contrato-content h2 {
    font-size: 12pt; font-weight: bold;
    text-transform: uppercase;
    margin-top: 18px; margin-bottom: 10px;
  }
  .contrato-content h3 {
    font-size: 11pt; font-weight: bold;
    margin-top: 14px; margin-bottom: 8px;
  }
  .contrato-content p {
    font-size: 11pt; line-height: 1.6;
    text-align: justify; margin-bottom: 10px;
  }
  .contrato-content p:empty {
    min-height: 1em; display: block;
  }
  .contrato-content strong { font-weight: bold; }
  .contrato-content em     { font-style: italic; }
  .contrato-content ul,
  .contrato-content ol {
    margin-left: 24px; margin-bottom: 12px; font-size: 11pt;
  }
  .contrato-content li  { margin-bottom: 4px; line-height: 1.5; }
  .contrato-content hr  { margin: 20px 0; border-top: 1px solid #000; }
  .contrato-content blockquote {
    border-left: 3px solid #555; padding-left: 12px;
    color: #333; font-style: italic; margin: 12px 0;
  }
`;

export function ContratoImprimible() {
  const { ventaCuotaId, plantillaId } = useParams();
  const printRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useContratoRender(
    Number(ventaCuotaId),
    Number(plantillaId),
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Contrato-${ventaCuotaId}`,
    pageStyle: `
      @page {
        size: letter;
        margin: 2.5cm;
      }
      body {
        margin: 0;
        padding: 0;
        background: white;
        font-family: Arial, sans-serif;
      }
    `,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-xs">Generando contrato...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-xs">No se pudo cargar el contrato.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra acción */}
      <div className="flex justify-end gap-3 px-4 pt-4 pb-4">
        <Button
          size="sm"
          className="gap-2 h-8 text-xs"
          onClick={() => handlePrint()}
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Preview — hoja carta centrada */}
      <div className="flex justify-center px-4 pb-8">
        <div className="bg-white shadow-xl w-full max-w-[21.59cm] min-h-[27.94cm]">
          {/* ref apunta aquí — incluye los estilos DENTRO */}
          <div ref={printRef}>
            {/* Estilos inyectados dentro del ref para que react-to-print los lleve al iframe */}
            <style>{CONTRATO_STYLES}</style>

            <div
              style={{
                padding: "2.5cm",
                color: "black",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <div
                className="contrato-content"
                dangerouslySetInnerHTML={{ __html: data.html }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContratoImprimible;
