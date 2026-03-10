export interface VariableItem {
  key: string;
  label: string;
  example: string;
}

export interface VariableGroup {
  group: string;
  icon: string;
  items: VariableItem[];
}

export const PLANTILLA_VARIABLES: VariableGroup[] = [
  {
    group: "Cliente",
    icon: "👤",
    items: [
      { key: "cliente.id", label: "ID", example: "12" },
      { key: "cliente.nombre", label: "Nombre", example: "María" },
      { key: "cliente.apellidos", label: "Apellidos", example: "López Pérez" },
      {
        key: "cliente.nombreCompleto",
        label: "Nombre completo",
        example: "María López Pérez",
      },
      { key: "cliente.dpi", label: "DPI", example: "1234567890101" },
      { key: "cliente.nit", label: "NIT", example: "1234567-8" },
      { key: "cliente.telefono", label: "Teléfono", example: "55551234" },
      {
        key: "cliente.direccion",
        label: "Dirección",
        example: "Zona 1, Jacaltenango",
      },
      { key: "cliente.municipio", label: "Municipio", example: "Jacaltenango" },
      {
        key: "cliente.departamento",
        label: "Departamento",
        example: "Huehuetenango",
      },
    ],
  },
  {
    group: "Crédito",
    icon: "💳",
    items: [
      { key: "credito.id", label: "ID", example: "18" },
      { key: "credito.numeroCredito", label: "N° crédito", example: "VC-18" },
      { key: "credito.totalVenta", label: "Total venta", example: "3000.00" },
      { key: "credito.montoVenta", label: "Monto venta", example: "2800.00" },
      {
        key: "credito.cuotaInicial",
        label: "Cuota inicial",
        example: "300.00",
      },
      {
        key: "credito.montoTotalConInteres",
        label: "Monto total c/interés",
        example: "3360.00",
      },
      { key: "credito.cuotasTotales", label: "Cuotas totales", example: "12" },
      { key: "credito.interes", label: "Interés (%)", example: "5" },
      { key: "credito.moraDiaria", label: "Mora diaria", example: "2.50" },
      {
        key: "credito.diasEntrePagos",
        label: "Días entre pagos",
        example: "30",
      },
      { key: "credito.diasGracia", label: "Días de gracia", example: "3" },
      {
        key: "credito.frecuenciaPago",
        label: "Frecuencia de pago",
        example: "MENSUAL",
      },
      { key: "credito.interesTipo", label: "Tipo de interés", example: "NONE" },
      {
        key: "credito.planCuotaModo",
        label: "Modo cuotas",
        example: "IGUALES",
      },
      { key: "credito.estado", label: "Estado", example: "ACTIVA" },
      { key: "credito.garantiaMeses", label: "Garantía (meses)", example: "6" },
      {
        key: "credito.comentario",
        label: "Comentario",
        example: "Cliente VIP",
      },
      { key: "credito.dpi", label: "DPI registrado", example: "1234567890101" },
      {
        key: "credito.fechaInicio",
        label: "Fecha inicio",
        example: "01/02/2026",
      },
      {
        key: "credito.fechaContrato",
        label: "Fecha contrato",
        example: "01/02/2026",
      },
      {
        key: "credito.fechaProximoPago",
        label: "Próximo pago",
        example: "01/03/2026",
      },
      {
        key: "credito.creadoEn",
        label: "Creado en",
        example: "28/01/2026 14:30",
      },
    ],
  },
  {
    group: "Cuotas",
    icon: "📅",
    items: [
      { key: "cuotas.total", label: "Total cuotas", example: "12" },
      { key: "cuotas.pagadas", label: "Pagadas", example: "3" },
      { key: "cuotas.pendientes", label: "Pendientes", example: "9" },
      { key: "cuotas.vencidas", label: "Vencidas", example: "0" },
      { key: "cuotas.atrasadas", label: "Atrasadas", example: "2" }, //NUEVO

      {
        key: "cuotas.montoPorCuota",
        label: "Monto por cuota",
        example: "280.00",
      },
      {
        key: "cuotas.moraAcumulada",
        label: "Mora acumulada",
        example: "15.00",
      },
      { key: "cuotas.totalPagado", label: "Total pagado", example: "840.00" },
      {
        key: "cuotas.saldoPendiente",
        label: "Saldo pendiente",
        example: "2160.00",
      },
    ],
  },
  {
    group: "Abonos / Pagos",
    icon: "💰",
    items: [
      { key: "pagos.totalPagado", label: "Total pagado", example: "1000.00" },
      { key: "pagos.numeroPagos", label: "N° de pagos", example: "2" },
      {
        key: "pagos.fechaUltimoPago",
        label: "Último pago",
        example: "04/02/2026 10:00",
      },
    ],
  },
  {
    group: "Mora",
    icon: "⚠️",
    items: [
      { key: "mora.tieneMora", label: "¿Tiene mora?", example: "Sí" },
      { key: "mora.montoTotal", label: "Monto mora", example: "120.00" },
    ],
  },
  {
    group: "Venta / Productos",
    icon: "🛒",
    items: [
      { key: "venta.id", label: "ID venta", example: "55" },
      { key: "venta.totalVenta", label: "Total venta", example: "2800.00" },
      { key: "venta.fechaVenta", label: "Fecha venta", example: "28/01/2026" },
      { key: "venta.metodoPago", label: "Método de pago", example: "CREDITO" },
      {
        key: "venta.productos",
        label: "Lista productos",
        example: 'TV 50" x1 @ Q2800',
      },
    ],
  },
  {
    group: "Testigos",
    icon: "",
    items: [
      {
        key: "testigo1.nombre",
        label: "Testigo 1 nombre",
        example: "Juan Pérez",
      },
      { key: "testigo1.dpi", label: "Testigo 1 DPI", example: "2345678901234" },
      {
        key: "testigo2.nombre",
        label: "Testigo 2 nombre",
        example: "Ana García",
      },
      { key: "testigo2.dpi", label: "Testigo 2 DPI", example: "3456789012345" },
    ],
  },
  {
    group: "Sucursal",
    icon: "🏢",
    items: [
      { key: "sucursal.id", label: "ID", example: "1" },
      { key: "sucursal.nombre", label: "Nombre", example: "Central" },
      { key: "sucursal.direccion", label: "Dirección", example: "Zona 1" },
      { key: "sucursal.telefono", label: "Teléfono", example: "77660000" },
    ],
  },
  {
    group: "Vendedor",
    icon: "",
    items: [
      { key: "vendedor.id", label: "ID", example: "3" },
      { key: "vendedor.nombre", label: "Nombre", example: "Carlos Ramos" },
      { key: "vendedor.telefono", label: "Teléfono", example: "55559999" },
    ],
  },
  {
    group: "Flags",
    icon: "🚩",
    items: [
      { key: "flags.tieneMora", label: "¿Tiene mora?", example: "No" },
      { key: "flags.creditoActivo", label: "¿Crédito activo?", example: "Sí" },
      { key: "flags.tieneEnganche", label: "¿Tiene enganche?", example: "Sí" },
    ],
  },
  {
    group: "Fecha / Sistema",
    icon: "🗓️",
    items: [
      { key: "sistema.fechaHoy", label: "Fecha hoy", example: "09/03/2026" },
      { key: "sistema.horaHoy", label: "Hora actual", example: "14:30" },
      {
        key: "sistema.fechaHoyLargo",
        label: "Fecha larga",
        example: "9 de marzo 2026",
      },
    ],
  },
];

export function extractUsedVariables(html: string): Set<string> {
  const regex = /{{\s*([^}]+)\s*}}/g;
  const used = new Set<string>();
  let match;
  while ((match = regex.exec(html)) !== null) {
    used.add(match[1].trim());
  }
  return used;
}
