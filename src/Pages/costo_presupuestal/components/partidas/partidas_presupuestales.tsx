import { PresupuestoListItem } from "@/Types/costos presupuestales/presupuestos_all";
import React from "react";
interface Props {
  data: PresupuestoListItem[];
  isLoading: boolean;
}
function PartidasPresupuestales({}: Props) {
  return (
    <div>
      <h2>Partidas presupuestales</h2>
    </div>
  );
}

export default PartidasPresupuestales;
