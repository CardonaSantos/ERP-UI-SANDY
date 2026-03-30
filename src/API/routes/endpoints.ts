export const erpEndpoints = {
  auth: {
    login: "/auth/login-user",
  },
  costos_presupuestales: {
    presupuestos: `/presupuestos`,
    byId: (id: number) => `/presupuestos/details/${id}`,
    ajustar: (id: number) => `/presupuestos/${id}`, // PATCH
    comprometer: (id: number) => `/presupuestos/${id}/comprometer`,
    ejercer: (id: number) => `/presupuestos/${id}/ejercer`,
    liberar: (id: number) => `/presupuestos/${id}/liberar`,

    // Catálogos
    partidas: `/partidas`,
    periodos: `/periodos`,
    centros_costos: `/centros-costo`,
  },
  tickets_boleta: {
    byId: (id: number) => `/tickets-soporte/get-ticket-boleta/${id}`,
  },
} as const;
