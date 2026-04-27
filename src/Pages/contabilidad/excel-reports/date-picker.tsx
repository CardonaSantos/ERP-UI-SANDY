"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";

interface DateRangePickerProps {
  fechaInicio?: Date;
  fechaFin?: Date;
  onChangeFechaInicio: (date: Date | null) => void;
  onChangeFechaFin: (date: Date | null) => void;
}

export function DateRangePicker({
  fechaInicio,
  fechaFin,
  onChangeFechaInicio,
  onChangeFechaFin,
}: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Fecha inicio */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Fecha inicio
        </label>
        <div className="relative">
          <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none z-10" />
          <DatePicker
            selected={fechaInicio}
            onChange={onChangeFechaInicio}
            selectsStart
            startDate={fechaInicio}
            endDate={fechaFin}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/aaaa"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            wrapperClassName="w-full"
          />
        </div>
      </div>

      {/* Fecha fin */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Fecha fin
        </label>
        <div className="relative">
          <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none z-10" />
          <DatePicker
            selected={fechaFin}
            onChange={onChangeFechaFin}
            selectsEnd
            startDate={fechaInicio}
            endDate={fechaFin}
            minDate={fechaInicio}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/aaaa"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            wrapperClassName="w-full"
          />
        </div>
      </div>
    </div>
  );
}
