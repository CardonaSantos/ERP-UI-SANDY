import { createApiClient } from "./createApiClient";
import { createApiHooks } from "./useQueryHooksCrm";
const baseUrl = import.meta.env.VITE_API_URL;
const erpClient = createApiClient(baseUrl);

export const erp = createApiHooks(erpClient);
