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
import "./styles/sales-tools.css";
import "./styles/sales-structure.css";
import "./styles/home-redesign.css";
import "./styles/site-redesign.css";
import "./styles/order-flow.css";
import App from "./App";
import { initAnalytics } from "./lib/analytics";

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
