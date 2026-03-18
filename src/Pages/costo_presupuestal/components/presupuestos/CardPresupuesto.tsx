import React from "react";
import { PresupuestoListItem } from "@/Types/costos presupuestales/presupuestos_all";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  ChevronRight,
  Info,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  item: PresupuestoListItem;
}

const CardPresupuesto: React.FC<Props> = ({ item }) => {
  // --- Lógica de Negocio en UI ---
  const montoConsumido = item.montoComprometido + item.montoEjercido;
  const porcentajeConsumido = Math.min(
    (montoConsumido / item.montoAsignado) * 100,
    100,
  );

  // Formateador de moneda (Quetzales)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(amount);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Header: Partida y Sucursal */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Tag size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">
              {item.partida.codigo} - {item.partida.nombre}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Building2 size={12} /> {item.sucursal} •{" "}
              {item.centroCosto.nombre}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            item.periodo.estado === true
              ? "bg-green-100 text-green-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {item.periodo.estado}
        </span>
      </div>

      {/* Body: Los 4 Fantásticos (Saldos) */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
            Asignado
          </p>
          <p className="text-sm font-semibold text-slate-700">
            {formatCurrency(item.montoAsignado)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
            Disponible
          </p>
          <p className="text-sm font-bold text-blue-600">
            {formatCurrency(item.montoDisponible)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
            Comprometido
          </p>
          <p className="text-sm font-medium text-amber-600">
            {formatCurrency(item.montoComprometido)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
            Ejercido
          </p>
          <p className="text-sm font-medium text-emerald-600">
            {formatCurrency(item.montoEjercido)}
          </p>
        </div>
      </div>

      {/* Barra de Progreso de Consumo */}
      <div className="px-4 pb-2">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-slate-500 font-medium">Consumo Total</span>
          <span className="font-bold text-slate-700">
            {porcentajeConsumido.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              porcentajeConsumido > 90
                ? "bg-red-500"
                : porcentajeConsumido > 70
                  ? "bg-amber-500"
                  : "bg-blue-500"
            }`}
            style={{ width: `${porcentajeConsumido}%` }}
          ></div>
        </div>
      </div>

      {/* Footer: Acciones */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1 text-slate-500">
          <Calendar size={14} />
          <span className="text-xs">{item.periodo.nombre}</span>
        </div>

        <Link
          to={`/control-presupuestal/detalle/${item.id}`}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Ver Historial <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default CardPresupuesto;
