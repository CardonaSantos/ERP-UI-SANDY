// import { createApiClient } from "./createApiClient";
// import { createApiHooks } from "./useQueryHooksCrm";
// const baseUrl = import.meta.env.VITE_API_URL;
// const erpClient = createApiClient(baseUrl);

// export const erp = createApiHooks(erpClient);

// Archivo donde exportas `erp` (ej: erpApi.ts)
import { axiosClient } from "@/hooks/getClientsSelect/Queries/axiosClient";
import { createApiHooks } from "./useQueryHooksCrm";
// 1. Importa tu instancia antigua de Axios

// 2. Pásale esa instancia directamente al factory de hooks
export const erp = createApiHooks(axiosClient);
