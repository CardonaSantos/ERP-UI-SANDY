import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import WarrantyTicket from "./WarrantyTicket";
import { GarantiaType } from "@/Types/Warranty/Warranty";
const API_URL = import.meta.env.VITE_API_URL;

function WarrantyPage() {
  // Obtén el parámetro id de la URL
  const { id } = useParams();
  const [garantia, setGarantia] = useState<GarantiaType[]>([]);

  useEffect(() => {
    const getTicketFormar = async () => {
      try {
        const response = await axios.get(`${API_URL}/warranty/${id}`);
        if (response.status === 200) {
          setGarantia(response.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error al conseguir modelo de ticket");
      }
    };
    if (id) {
      getTicketFormar();
    }
  }, [id]);

  console.log("El registro de garantía es: ", garantia);

  return (
    <div>
      {garantia ? (
        <PDFViewer width="100%" height="600">
          <WarrantyTicket garantia={garantia} />
        </PDFViewer>
      ) : (
        <p className="text-center font-extrabold text-xl">Cargando PDF</p>
      )}
    </div>
  );
}

export default WarrantyPage;
