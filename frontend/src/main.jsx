import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Provider store={store}>
    <SidebarProvider>
      <App />
      </SidebarProvider>
    </Provider>
  </BrowserRouter>,
);
