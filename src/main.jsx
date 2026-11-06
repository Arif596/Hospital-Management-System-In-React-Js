import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./Context/AppContext.jsx";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>

);
