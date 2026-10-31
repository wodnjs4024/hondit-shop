import './styles/analytics-consent.css';
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./styles/global.css";
import "./styles/v23.css";
import "./styles/admin.css";
import "./styles/admin-catalog.css";
import "./styles/sales-tools.css";
import "./styles/sales-structure.css";
import "./styles/home-redesign.css";
import "./styles/site-redesign.css";
import "./styles/order-flow.css";
import "./styles/shop-assistant.css";
import "./styles/journal.css";
import App from "./App";
import { initAnalytics } from "./lib/analytics";

// A password reset link that lands on another page (Supabase falls back to the site address) still reaches the reset form.
if (/(^|&|#)type=recovery(&|$)/.test(window.location.hash) && window.location.pathname !== "/admin/reset-password") {
  window.location.replace(`/admin/reset-password${window.location.hash}`);
}

initAnalytics();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
import "./styles/checkout-flow.css";
import './styles/sales-presentation.css';
import "./styles/commerce-v4.css";
import "./styles/about.css";
import "./styles/dark-accents.css";
