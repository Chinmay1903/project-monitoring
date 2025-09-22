import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./AppHeader.css";

const ROUTE_TITLES = {
    "/dashboard": "Dashboard",
    "/projects": "Project Listing",
    "/resources": "Resource Details",
    "/tasks": "Task Monitoring",
};

export default function AppHeader({
    logoSrc = "images/logo.png",
}) {
    const location = useLocation();
    const routeTitle = ROUTE_TITLES[location.pathname] || "";

    return (
        <header className="app-header-root pm-appbar d-flex align-items-center justify-content-between mb-2">
            <div className="pm-brand">
                <img src={logoSrc} alt="logo" className="pm-logo" />
                {routeTitle && <span className="route-name">Project Monitor</span>}
            </div>

            <ul className="nav pm-tabs">
                <li className="nav-item">
                    <NavLink end to="/dashboard" className={"nav-link" + (location.pathname === "/dashboard" ? " active" : "")}>
                        <i className="bi bi-speedometer2"></i>
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/projects" className={"nav-link" + (location.pathname === "/projects" ? " active" : "")}>
                        <i className="bi bi-list-task"></i>
                        <span>Project Listing</span>
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/resources" className={"nav-link" + (location.pathname === "/resources" ? " active" : "")}>
                        <i className="bi bi-people"></i>
                        <span>Resource Details</span>
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/tasks" className={"nav-link" + (location.pathname === "/tasks" ? " active" : "")}>
                        <i className="bi bi-clipboard-check"></i>
                        <span>Task Monitoring</span>
                    </NavLink>
                </li>
            </ul>

            {/* Admin chip (right) */}
            <button className="pm-admin btn btn-sm">
                <i className="bi bi-person-circle me-1"></i> Admin
            </button>
        </header>
    );
}
