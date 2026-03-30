import { Partida } from "@/Types/costos presupuestales/partida-periodo-costo";
interface Props {
  data: Partida[];
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
