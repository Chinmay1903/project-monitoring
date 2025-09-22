import React from "react";
import AppHeader from "./AppHeader";
import "./AppLayout.css";                 // minimal
import "../dashboard-global.css"; // dashboard vars/surface

export default function AppLayout({
  children,
  footerText = "© 2025 · Project Monitoring — Gianmind Solutions Pvt Ltd",
}) {
  return (
    <div className="dashboard-root">
      <div className="container-fluid px-0">
        <AppHeader />
        <main className="app-main">{children}</main>
        <footer className="app-footer pm-footer text-center small">
          {footerText}
        </footer>
      </div>
    </div>
  );
}
