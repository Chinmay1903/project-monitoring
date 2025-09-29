import React, { useMemo, useState, useEffect, useRef } from "react";
import AppLayout from "../components/AppLayout";
import "./ProjectList.css";

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
    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    // ---- modal (single for add/edit) ----
    const emptyForm = { id: "", name: "", manager: "", lead: "", podLead: "", trainer: "", start: "" };
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [mode, setMode] = useState("add");
    const [submitted, setSubmitted] = useState(false);

    const managers = useMemo(() => ["N. Gupta", "L. Kulkarni"], []);
    const leads = useMemo(() => ["P. Mehta", "A. Verma", "S. Rao"], []);
    const podLeads = useMemo(() => ["M. Iyer", "Z. Khan"], []);
    const trainers = useMemo(() => ["Rahul Shah", "Vikram Patel", "Arjun Menon", "Asha Kumar", "Ishita Bose", "Neha Das"], []);

    useEffect(() => {
        // autosize all selects with the .auto-size class in the header
        document
            .querySelectorAll(".pl-scope .filter-wrap .auto-size")
            .forEach((el) => autosizeSelect(el));
    }, [fManager, fLead, fPodLead]);

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
    const nextId = () => {
        const max = rows.reduce((acc, r) => Math.max(acc, parseInt(r.id.replace("GMP", ""), 10)), 0);
        return `GMP${String(max + 1).padStart(3, "0")}`;
    };

    // ---- CRUD ----
    const onAddClick = () => {
        setForm({ ...emptyForm, id: nextId() });
        setMode("add"); setSubmitted(false); setShowModal(true);
    };
    const onEdit = (r) => {
        setForm({ ...r }); setMode("edit"); setSubmitted(false); setShowModal(true);
    };
    const onDelete = (id) => {
        if (window.confirm("Delete this project?")) setRows(prev => prev.filter(r => r.id !== id));
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
        else setRows(prev => prev.map(r => (r.id === form.id ? { ...form } : r)));
        setShowModal(false);
    };

    // Display Date as DD-MM-YYYY
    const toDMY = (ymd) => {
        if (!ymd) return "";
        const [y, m, d] = ymd.split("-");
        return (y && m && d) ? `${d}-${m}-${y}` : ymd;
    };
    const toYMD = (dmy) => {
        if (!dmy) return "";
        const [d, m, y] = dmy.split("-");
        return (d && m && y) ? `${y}-${m}-${d}` : dmy;
    };

    return (
        <AppLayout>
            <div className="pl-scope px-2 py-2">
                {/* Add button: icon-first with hover label */}
                <div className="d-flex justify-content-end mb-2">
                    <button className="btn btn-primary action-btn" onClick={onAddClick} title="Add Project">
                        <i className="bi bi-plus-circle" /><span className="label">Add Project</span>
                    </button>
                </div>

                <div className="card shadow-lg bg-body-tertiary rounded-3 border-3 shadow">
                    <div className="card-header bg-warning-subtle text-warning-emphasis">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">

                            {/* LEFT: Title + SEARCH inline */}
                            <div className="d-flex align-items-center gap-5 flex-nowrap">
                                <h5 className="mb-0">Projects</h5>

                                {/* Search right next to the title */}
                                <div className="input-group header-search">
                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-funnel" />
                                    </span>
                                    <input
                                        className="form-control"
                                        placeholder="All Projects (search by name)"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* RIGHT: Filters */}
                            <div className="d-flex align-items-center filter-wrap">
                                <select
                                    className="form-select auto-size"
                                    value={fManager}
                                    onChange={(e) => setFManager(e.target.value)}
                                >
                                    <option>All Managers</option>
                                    {managers.map((m) => <option key={m}>{m}</option>)}
                                </select>

                                <select
                                    className="form-select auto-size"
                                    value={fLead}
                                    onChange={(e) => setFLead(e.target.value)}
                                >
                                    <option>All Leads</option>
                                    {leads.map((m) => <option key={m}>{m}</option>)}
                                </select>

                                <select
                                    className="form-select auto-size"
                                    value={fPodLead}
                                    onChange={(e) => setFPodLead(e.target.value)}
                                >
                                    <option>All Pod Leads</option>
                                    {podLeads.map((m) => <option key={m}>{m}</option>)}
                                </select>
                                <input
                                    placeholder="From Date"
                                    type="text"
                                    className="form-control date-input"
                                    value={from}                               // store/display as dd-mm-yyyy
                                    onChange={(e) => setFrom(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.type = "date";                  // show native picker
                                        if (from) e.target.value = toYMD(from);  // convert display to yyyy-mm-dd for picker
                                    }}
                                    onBlur={(e) => {
                                        const picked = e.target.value;           // yyyy-mm-dd from picker
                                        e.target.type = "text";                  // back to text (placeholder visible)
                                        setFrom(picked ? toDMY(picked) : "");    // show dd-mm-yyyy
                                    }}
                                />
                                <input
                                    placeholder="To Date"
                                    type="text"
                                    className="form-control date-input"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.type = "date";
                                        if (to) e.target.value = toYMD(to);
                                    }}
                                    onBlur={(e) => {
                                        const picked = e.target.value;
                                        e.target.type = "text";
                                        setTo(picked ? toDMY(picked) : "");
                                    }}
                                />
                                <button className="btn btn-outline-secondary reset" onClick={resetFilters}>
                                    <i className="bi bi-arrow-counterclockwise" /><span className="label">Reset</span>
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* TABLE */}
                    <div className="table-responsive bg-warning-subtle text-warning-emphasis rounded shadow">
                        <table className="table table-info table-striped-columns table-hover align-middle mb-0 has-actions">
                            <thead className="table-success">
                                <tr>
                                    <Th label="ID" k="id" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Project Name" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Manager" k="manager" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Lead" k="lead" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Pod Lead" k="podLead" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Trainer" k="trainer" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <Th label="Start Date" k="start" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                    <th className="actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id}>
                                        <td className="text-muted">{r.id}</td>
                                        <td className="fw-semibold">{r.name}</td>
                                        <td>{r.manager}</td>
                                        <td>{r.lead}</td>
                                        <td>{r.podLead}</td>
                                        <td>{r.trainer}</td>
                                        <td>{toDMY(r.start)}</td>
                                        <td className="actions-col">
                                            <div className="action-wrap">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm action-btn"
                                                    onClick={() => onEdit(r)}
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil-square" /><span className="label">Edit</span>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm action-btn"
                                                    onClick={() => onDelete(r.id)}
                                                    title="Delete"
                                                >
                                                    <i className="bi bi-trash3" /><span className="label">Delete</span>
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
                                                            value={toDMY(from.start)}
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
                        <div className="modal-backdrop fade show"></div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

/* -- Sortable header cell (CSHTML-like UI) -- */
function Th({ label, k, sortKey, sortDir, onSort }) {
    const active = sortKey === k;
    const icon = active ? (sortDir === "asc" ? "bi-arrow-up text-primary" : "bi-arrow-down text-primary") : "bi-arrow-down-up";
    return (
        <th className={`sortable ${active ? "active" : ""}`}>
            <button type="button" className="sort-btn" onClick={() => onSort(k)} title={`Sort by ${label}`}>
                {label} <i className={`bi ${icon} sort-icon`} />
            </button>
        </th>
    );
}

// Utility: fit a <select> to its selected option text
function autosizeSelect(el) {
    if (!el) return;
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.whiteSpace = "pre";
    span.style.position = "absolute";
    span.textContent = el.options[el.selectedIndex]?.text || "";
    document.body.appendChild(span);
    // base + caret + padding buffer
    const w = Math.ceil(span.getBoundingClientRect().width + 48);
    el.style.width = `${w}px`;
    document.body.removeChild(span);
}
