// src/main.jsx
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RecoilRoot } from "recoil";
import App from "./App";
import "./index.css";
import { ThemeProvider } from './hooks/ThemeContext';
import CookieConsent from "./services/cookieconsent";

createRoot(document.getElementById("root")).render(
  (
    // Wrap your entire application with CookieConsent
    <CookieConsent>
      <RecoilRoot>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </RecoilRoot>
    </CookieConsent>
  )
);