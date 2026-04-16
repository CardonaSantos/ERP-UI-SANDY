// import axios from "axios";
// import { CerrarCajaV2Dto, PreviaCierreResponse } from "./cierre.types";
// import { CerrarCajaV2Response } from "./cierres.types";

// const API_URL = import.meta.env.VITE_API_URL;

// export async function getPreviaCierre(
//   registroCajaId: number,
// ): Promise<PreviaCierreResponse> {
//   const { data } = await axios.get(`${API_URL}/caja/previa-cierre`, {
//     params: { registroCajaId },
//   });
//   return data as PreviaCierreResponse;
// }

// export async function cerrarCajaV2(
//   payload: CerrarCajaV2Dto,
// ): Promise<CerrarCajaV2Response> {
//   const { data } = await axios.post(`${API_URL}/caja/cerrar-v3`, payload);
//   return data as CerrarCajaV2Response;
// }

// export type { PreviaCierreResponse, CerrarCajaV2Dto, CerrarCajaV2Response };
