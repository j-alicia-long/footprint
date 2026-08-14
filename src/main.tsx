import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { stripBase } from "./base-path";
import "./styles/global.scss";

const rootElement = document.getElementById("root");
if (rootElement == null) throw new Error("Missing #root element");

createRoot(rootElement).render(
  <StrictMode>
    {/* Page switches are plain anchor loads (no router), so reading the
        pathname once at startup is safe — it cannot change while mounted. */}
    {/* eslint-disable-next-line no-restricted-properties */}
    <App path={stripBase(window.location.pathname)} />
  </StrictMode>,
);
