import { Periodo } from "@/Types/costos presupuestales/partida-periodo-costo";

interface Props {
  data: Periodo[];
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
