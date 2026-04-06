export const erpEndpoints = {
  auth: {
    login: "/auth/login-user",
  },
  costos_presupuestales: {
    presupuestos: `/presupuestos`,
    presupuestos_select: `/presupuestos/select`,

    byId: (id: number) => `/presupuestos/details/${id}`,
    ajustar: (id: number) => `/presupuestos/${id}`, // PATCH
    comprometer: (id: number) => `/presupuestos/${id}/comprometer`,
    ejercer: (id: number) => `/presupuestos/${id}/ejercer`,
    liberar: (id: number) => `/presupuestos/${id}/liberar`,

    // Catálogos
    partidas: `/partidas`,
    periodos: `/periodos`,
    centros_costos: `/centros-costo`,
    movimientos_presupuestales: `/movimientos`,
  },
  // REQUISICIONES
  requisiciones: {
    create: `/requisicion`,
    findAll: `/requisicion`,
    generate_purchase: `/compra-requisicion/generar-compra`,
    delete: (id: number) => `/requisicion/${id}`,
    get_one: (id: number) => `/requisicion/one-requisicion/${id}`,
    make_requisicion: (id: number) => `/requisicion/one-requisicion/${id}`,
    get_requisicion_to_edit: (id: number) =>
      `/requisicion/requisicion-to-edit/${id}`,
    update_requisicion: () => `requisicion/update`,
  },
  tickets_boleta: {
    byId: (id: number) => `/tickets-soporte/get-ticket-boleta/${id}`,
  },
} as const;
