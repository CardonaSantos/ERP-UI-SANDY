import { PresupuestoListItem } from "@/Types/costos presupuestales/presupuestos_all";
import React from "react";

interface Props {
  data: PresupuestoListItem[];
  isLoading: boolean;
}

function PeriodosPresupuestales({}: Props) {
  return (
    <div>
      <h2>Periodos presupuestales</h2>
    </div>
  );
}

export default PeriodosPresupuestales;
