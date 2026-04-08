import axios from "axios";
export function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  return client;
}
// export function createApiClient(baseURL: string) {
//   const client = axios.create({
//     baseURL,
//     timeout: 10000,
//     headers: {
//       Accept: "application/json",
//     },
//   });

//   return client;
// }
