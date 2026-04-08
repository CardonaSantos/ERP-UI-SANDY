import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { GoogleMapsProvider } from "./Crm/CrmRutas/CrmRutasCobro/GoogleMapsProvider .tsx";
import { QueryProvider } from "./Server/QueryProvider.tsx";
import { SocketProvider } from "./Web/realtime/SocketProvider.tsx";
const VITE_WS_URL = import.meta.env.VITE_WS_URL;
const VITE_WS_NAMESPACE = "/legacy";
const VITE_WS_PATH = "/socket.io";

const getToken = () => localStorage.getItem("authTokenPos");

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <StrictMode>
      <SocketProvider
        baseUrl={VITE_WS_URL}
        namespace={VITE_WS_NAMESPACE}
        path={VITE_WS_PATH}
        getToken={getToken}
        debug={import.meta.env.DEV}
        withCredentials={false}
      >
        <GoogleMapsProvider>
          <QueryProvider>
            <App />
          </QueryProvider>
        </GoogleMapsProvider>
      </SocketProvider>
    </StrictMode>
  </ThemeProvider>,
);
