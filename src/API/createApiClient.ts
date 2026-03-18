import axios from "axios";

export function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      Accept: "application/json",
    },
  });

  return client;
}
