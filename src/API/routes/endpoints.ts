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
    candidates: `/requisicion/candidatos-requisicion`,
  },

  //COMPRAS
  compras: {
    get_compras: `/compra-requisicion/get-registros-compras-con-detalle`,
    get_compra_details: (id: number) =>
      `/compra-requisicion/get-registro/${id}`,

    detalles: (id: number) => `/compra-requisicion/get-registro/${id}`,
    recepcionable: "compras/get-data-compra-parcial",
    recepcionar: (id: number) => `/compra-requisicion/${id}/recepcionar`,
    recepcionar_parcial: "compras/create-recepcion-parcial",
  },

  proveedores: "/proveedor",

  cuentas_bancarias: "cuentas-bancarias/get-simple-select",
  cajas: {
    disponibles: (sucursalId: number) =>
      `/caja/cajas-disponibles/${sucursalId}`,
    cerrar_caja: `/caja/cerrar-v3`,

    iniciar_caja: `/caja/iniciar-caja`,

    caja_previa_data: `/caja/previa-cierre`,
    ultima_caja_abierta: (sucursalId: number, userId: number) =>
      `/caja/find-cash-regist-open/${sucursalId}/${userId}`,

    ultimo_saldo_sucursal: (sucursalId: number, userId: number) =>
      `/caja/get-ultimo-saldo-usuario/${sucursalId}/${userId}`,

    list_registros: `/caja/list-cajas`,
  },

  movimiento: {
    delete_movimiento: (movimientoId: number) =>
      `/movimiento-caja/delete-movimiento/${movimientoId}`,
    create_movimiento: `/movimiento-financiero`,
    list_movimientos: `/movimientos-cajas`,
  },

  creditos: {
    documento_compra: (id: number) => `/credito-documento-compra/${id}`,
  },

  tickets_boleta: {
    byId: (id: number) => `/tickets-soporte/get-ticket-boleta/${id}`,
  },
  excel: {
    cajas: `/excel-reports/cajas`,
  },

  // CONTABILIDAD
  contabilidad: {
    cuentas: {
      get_all: "/cuentas-contables",
      create: "/cuentas-contables",
      update: (id: number) => `/cuentas-contables/${id}`,
      delete: (id: number) => `/cuentas-contables/${id}`,
    },
    reglas: {
      get_all: "/reglas-contables",
      create: "/reglas-contables",
      update: (id: number) => `/reglas-contables/${id}`,
      delete: (id: number) => `/reglas-contables/${id}`,
    },
    asientos: {
      get_all: "/asientos-contables",
      get_one: (id: number) => `/asientos-contables/${id}`,
      create: "/asientos-contables",
      anular: (id: number) => `/asientos-contables/${id}/anular`,
    },
  },
} as const;
