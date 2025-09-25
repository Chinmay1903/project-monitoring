import React, { useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import "./ProjectList.css";

/**
 * Project List (single React function)
 * - Filters: project search, manager, lead, pod lead, from/to date
 * - Sort: click any header
 * - Actions: Add/Edit in one modal, Delete with confirm
 * - Validations: required fields
 * - Styling via ProjectList.css to match the screenshot
 */
export default function ProjectList() {
    // ---- seed data ----
    const seed = [
        { id: "GMP002", name: "Billing Migration", manager: "N. Gupta", lead: "P. Mehta", podLead: "M. Iyer", trainer: "Rahul Shah", start: "2025-05-12" },
        { id: "GMP004", name: "Data Lake ETL", manager: "L. Kulkarni", lead: "A. Verma", podLead: "Z. Khan", trainer: "Vikram Patel", start: "2025-04-28" },
        { id: "GMP006", name: "Fraud Engine", manager: "L. Kulkarni", lead: "A. Verma", podLead: "Z. Khan", trainer: "Arjun Menon", start: "2025-06-15" },
        { id: "GMP001", name: "Inventory Revamp", manager: "N. Gupta", lead: "S. Rao", podLead: "M. Iyer", trainer: "Asha Kumar", start: "2025-06-02" },
        { id: "GMP003", name: "Mobile App v3", manager: "L. Kulkarni", lead: "A. Verma", podLead: "Z. Khan", trainer: "Ishita Bose", start: "2025-07-01" },
        { id: "GMP005", name: "Partner Portal", manager: "N. Gupta", lead: "S. Rao", podLead: "M. Iyer", trainer: "Neha Das", start: "2025-08-05" },
    ];
    const [rows, setRows] = useState(seed);

    // ---- filters ----
    const [q, setQ] = useState("");
    const [fManager, setFManager] = useState("All Managers");
    const [fLead, setFLead] = useState("All Leads");
    const [fPodLead, setFPodLead] = useState("All Pod Leads");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    // ---- sort ----
    const [sortKey, setSortKey] = useState("name");
    const [sortDir, setSortDir] = useState("asc");

    // ---- modal (single for add/edit) ----
    const emptyForm = { id: "", name: "", manager: "", lead: "", podLead: "", trainer: "", start: "" };
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [mode, setMode] = useState("add"); // "add" | "edit"
    const [submitted, setSubmitted] = useState(false);

    const managers = useMemo(
        () => ["N. Gupta", "L. Kulkarni"],
        []
    );
    const leads = useMemo(() => ["P. Mehta", "A. Verma", "S. Rao"], []);
    const podLeads = useMemo(() => ["M. Iyer", "Z. Khan"], []);
    const trainers = useMemo(() => ["Rahul Shah", "Vikram Patel", "Arjun Menon", "Asha Kumar", "Ishita Bose", "Neha Das"], []);

    // ---- derived: filtered + sorted ----
    const filtered = useMemo(() => {
        let d = [...rows];
        if (q.trim()) d = d.filter(r => r.name.toLowerCase().includes(q.trim().toLowerCase()));
        if (fManager !== "All Managers") d = d.filter(r => r.manager === fManager);
        if (fLead !== "All Leads") d = d.filter(r => r.lead === fLead);
        if (fPodLead !== "All Pod Leads") d = d.filter(r => r.podLead === fPodLead);
        if (from) d = d.filter(r => r.start >= from);
        if (to) d = d.filter(r => r.start <= to);

        d.sort((a, b) => {
            const A = (a[sortKey] ?? "").toString().toLowerCase();
            const B = (b[sortKey] ?? "").toString().toLowerCase();
            if (A < B) return sortDir === "asc" ? -1 : 1;
            if (A > B) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return d;
    }, [rows, q, fManager, fLead, fPodLead, from, to, sortKey, sortDir]);

    // ---- helpers ----
    const resetFilters = () => {
        setQ(""); setFManager("All Managers"); setFLead("All Leads"); setFPodLead("All Pod Leads"); setFrom(""); setTo("");
    };
    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };
    const nextId = () => {
        const max = rows.reduce((acc, r) => Math.max(acc, parseInt(r.id.replace("GMP", ""), 10)), 0);
        const n = String(max + 1).padStart(3, "0");
        return `GMP${n}`;
    };

    // ---- CRUD ----
    const onAddClick = () => {
        setForm({ ...emptyForm, id: nextId() });
        setMode("add"); setSubmitted(false);
        setShowModal(true);
    };
    const onEdit = (r) => {
        setForm({ ...r });
        setMode("edit"); setSubmitted(false);
        setShowModal(true);
    };
    const onDelete = (id) => {
        if (window.confirm("Delete this project?")) {
            setRows(prev => prev.filter(r => r.id !== id));
        }
    };

    // ---- validation ----
    const errors = useMemo(() => {
        const e = {};
        if (!form.name.trim()) e.name = "Project name is required.";
        if (!form.manager) e.manager = "Manager is required.";
        if (!form.lead) e.lead = "Lead is required.";
        if (!form.podLead) e.podLead = "Pod lead is required.";
        if (!form.trainer) e.trainer = "Trainer is required.";
        if (!form.start) e.start = "Start date is required.";
        return e;
    }, [form]);
    const isValid = Object.keys(errors).length === 0;

    const onSave = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!isValid) return;

        if (mode === "add") setRows(prev => [{ ...form }, ...prev]);
        else setRows(prev => prev.map(r => r.id === form.id ? { ...form } : r));

        setShowModal(false);
    };

    // ---- view ----
    return (
        <AppLayout>
            <div className="projects-page">
                <div className="projects-actions d-flex justify-content-end">
                    <button className="btn btn-primary" onClick={onAddClick} title="Add Project">
                        <i className="bi bi-plus-lg" />
                    </button>
                </div>


                {/* TITLE + FILTER BAR */}
                <div className="projects-card card shadow-sm">
                    <div className="projects-toolbar d-flex justify-content-between">
                        <div className="title">Projects</div>

                        <div className="filters">
                            {/* search / All Projects */}
                            <div className="input-group filter-item">
                                <span className="input-group-text"><i className="bi bi-funnel" /></span>
                                <input
                                    className="form-control"
                                    placeholder="All Projects (search by name)"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />
                            </div>

                            <select className="form-select filter-item" value={fManager} onChange={(e) => setFManager(e.target.value)}>
                                <option>All GMS Managers</option>
                                {managers.map(m => <option key={m}>{m}</option>)}
                            </select>

                            <select className="form-select filter-item" value={fLead} onChange={(e) => setFLead(e.target.value)}>
                                <option>All Turing Manager</option>
                                {leads.map(m => <option key={m}>{m}</option>)}
                            </select>

                            <select className="form-select filter-item" value={fPodLead} onChange={(e) => setFPodLead(e.target.value)}>
                                <option>All Pod Leads</option>
                                {podLeads.map(m => <option key={m}>{m}</option>)}
                            </select>

                            <input type="date" className="form-control filter-item" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From Date" />
                            <input type="date" className="form-control filter-item" value={to} onChange={(e) => setTo(e.target.value)} placeholder="To Date" />

                            <button className="btn btn-outline-secondary filter-item" onClick={resetFilters}>
                                <i className="bi bi-arrow-counterclockwise me-1" /> Reset
                            </button>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="table-responsive">
                        <table className="table table-hover projects-table">
                            <thead>
                                <tr>
                                    <Th label="ID" k="id" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Project Name" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Gms Manager" k="manager" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Turing Manager" k="lead" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Pod Lead" k="podLead" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Trainer" k="trainer" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Start Date" k="start" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <th style={{ width: 110 }} className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id}>
                                        <td className="text-muted">{r.id}</td>
                                        <td className="fw-semibold">{r.name}</td>
                                        <td>{r.manager}</td>
                                        <td><u>{r.lead}</u></td>
                                        <td><u>{r.podLead}</u></td>
                                        <td>{r.trainer}</td>
                                        <td>{r.start}</td>
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm" role="group">
                                                <button className="btn btn-outline-secondary" onClick={() => onEdit(r)} title="Edit">
                                                    <i className="bi bi-pencil-square" />
                                                </button>
                                                <button className="btn btn-outline-danger" onClick={() => onDelete(r.id)} title="Delete">
                                                    <i className="bi bi-trash" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={8} className="text-center py-4 text-muted">No projects match the filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ==== ONE MODAL for Add/Edit ==== */}
                {showModal && (
                    <>
                        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                            <div className="modal-dialog modal-xl modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{mode === "add" ? "Add Project" : "Edit Project"}</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close" />
                                    </div>

                                    <form onSubmit={onSave} noValidate>
                                        <div className="modal-body">
                                            <div className="container-fluid">
                                                <div className="row g-3">
                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Project Name <span className="text-danger">*</span></label>
                                                        <input
                                                            className={`form-control ${submitted && errors.name ? "is-invalid" : ""}`}
                                                            placeholder="Enter project name"
                                                            value={form.name}
                                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                        />
                                                        {submitted && errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Manager Name <span className="text-danger">*</span></label>
                                                        <select
                                                            className={`form-select ${submitted && errors.manager ? "is-invalid" : ""}`}
                                                            value={form.manager}
                                                            onChange={(e) => setForm({ ...form, manager: e.target.value })}
                                                        >
                                                            <option value="">Select manager</option>
                                                            {managers.map(m => <option key={m}>{m}</option>)}
                                                        </select>
                                                        {submitted && errors.manager && <div className="invalid-feedback">{errors.manager}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-3">
                                                        <label className="form-label">Lead Name <span className="text-danger">*</span></label>
                                                        <select
                                                            className={`form-select ${submitted && errors.lead ? "is-invalid" : ""}`}
                                                            value={form.lead}
                                                            onChange={(e) => setForm({ ...form, lead: e.target.value })}
                                                        >
                                                            <option value="">Select lead</option>
                                                            {leads.map(m => <option key={m}>{m}</option>)}
                                                        </select>
                                                        {submitted && errors.lead && <div className="invalid-feedback">{errors.lead}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-3">
                                                        <label className="form-label">Pod Lead Name <span className="text-danger">*</span></label>
                                                        <select
                                                            className={`form-select ${submitted && errors.podLead ? "is-invalid" : ""}`}
                                                            value={form.podLead}
                                                            onChange={(e) => setForm({ ...form, podLead: e.target.value })}
                                                        >
                                                            <option value="">Select pod lead</option>
                                                            {podLeads.map(m => <option key={m}>{m}</option>)}
                                                        </select>
                                                        {submitted && errors.podLead && <div className="invalid-feedback">{errors.podLead}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Trainer <span className="text-danger">*</span></label>
                                                        <select
                                                            className={`form-select ${submitted && errors.trainer ? "is-invalid" : ""}`}
                                                            value={form.trainer}
                                                            onChange={(e) => setForm({ ...form, trainer: e.target.value })}
                                                        >
                                                            <option value="">Select trainer</option>
                                                            {trainers.map(m => <option key={m}>{m}</option>)}
                                                        </select>
                                                        {submitted && errors.trainer && <div className="invalid-feedback">{errors.trainer}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Start Date <span className="text-danger">*</span></label>
                                                        <input
                                                            type="date"
                                                            className={`form-control ${submitted && errors.start ? "is-invalid" : ""}`}
                                                            value={form.start}
                                                            onChange={(e) => setForm({ ...form, start: e.target.value })}
                                                        />
                                                        {submitted && errors.start && <div className="invalid-feedback">{errors.start}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="modal-footer">
                                            <button type="submit" className="btn btn-primary">Save</button>
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Close</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        {/* lightweight backdrop */}
                        <div className="modal-backdrop fade show"></div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

/* --- small helper header cell (inside this file to keep single-function feel) */
function Th({ label, k, sortKey, sortDir, onSort }) {
    const active = sortKey === k;
    return (
        <th role="button" onClick={() => onSort(k)}>
            <span className="me-1">{label}</span>
            <span className={"sort " + (active ? sortDir : "")}>
                <i className="bi bi-arrow-down-up" />
            </span>
        </th>
    );
}
