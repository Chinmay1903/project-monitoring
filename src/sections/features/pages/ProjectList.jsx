import React, { useMemo, useState, useEffect, useRef } from "react";
import AppLayout from "../components/AppLayout";
import "./ProjectList.css";
import { getEmployeeNames,getProjects, addProject,updateProject,deleteProject } from "../../../api/features";
// import SearchableDropdown from "../components/SearchableDropdown";

/**
 * Project List (single React function)
 * - Filters: project search, manager, lead, pod lead, from/to date
 * - Sort: click any header
 * - Actions: Add/Edit in one modal, Delete with confirm
 * - Validations: required fields
 * - Styling via ProjectList.css to match the screenshot
 */
export default function ProjectList() {

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const todayYMD = new Date().toISOString().slice(0, 10);

    // ---- filters ----
    const [q, setQ] = useState("");
    const [fManager, setFManager] = useState("All Managers");
    const [fLead, setFLead] = useState("All Leads");
    const [fPodLead, setFPodLead] = useState("All Pod Leads");
    const [fTrainer, setFTrainer] = useState("All Trainers");
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
    const emptyForm = { id: "", name: "", manager: "", lead: "", podLead: "", trainer: "", start: todayYMD };
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [mode, setMode] = useState("add");
    const [submitted, setSubmitted] = useState(false);

    // const managers = useMemo(
    //     () => ["N. Gupta", "L. Kulkarni"],
    //     []
    // );
    // const leads = useMemo(() => ["P. Mehta", "A. Verma", "S. Rao"], []);
    // const podLeads = useMemo(() => ["M. Iyer", "Z. Khan"], []);
    // const trainers = useMemo(() => ["Rahul Shah", "Vikram Patel", "Arjun Menon", "Asha Kumar", "Ishita Bose", "Neha Das"], []);
    const [managers, setManagers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [podLeads, setPodLeads] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [managersList, setManagersList] = useState([]);
    const [podLeadsList, setPodLeadsList] = useState([]);
    const [trainersList, setTrainersList] = useState([]);

    // ---- load data from API ----
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [projRes, namesRes] = await Promise.all([getProjects(), getEmployeeNames()]);
                // projects
                const projectData = Array.isArray(projRes?.data) ? projRes.data.map(p => ({
                    ...emptyForm,
                    id: p.id ?? p.project_id ?? "",
                    name: (p.name ?? p.project_name ?? "").toString(),
                    manager: p.manager ?? p.gms_manager ?? "",
                    lead: p.lead ?? p.lead_name ?? "",
                    podLead: p.podLead ?? p.pod_name ?? p.pod_lead_name ?? "",
                    trainer: p.trainer ?? p.trainer_name ?? "",
                    start: (p.start ?? p.create_at ?? "").toString().split(' ')[0] || "",
                })) : [];
                setRows(projectData);
                // derive distinct lists from projectData (support multiple possible field names)
                const mgrSet = new Set();
                const leadSet = new Set();
                const podSet = new Set();
                const trainerSet = new Set();

                projectData.forEach(p => {
                    const mgr = p.gms_manager ?? p.manager ?? p.manager_name ?? p.gmsManager ?? "";
                    const lead = p.lead_name ?? p.lead ?? p.turing_manager ?? "";
                    const pod = p.pod_lead_name ?? p.podLead ?? p.pod_lead ?? "";
                    const tr = p.trainer_name ?? p.trainer ?? p.trainer_name ?? "";
                    if (mgr) mgrSet.add(String(mgr).trim());
                    if (lead) leadSet.add(String(lead).trim());
                    if (pod) podSet.add(String(pod).trim());
                    if (tr) trainerSet.add(String(tr).trim());
                });

                setManagers(Array.from(mgrSet).filter(Boolean).sort());
                setLeads(Array.from(leadSet).filter(Boolean).sort());
                setPodLeads(Array.from(podSet).filter(Boolean).sort());
                setTrainers(Array.from(trainerSet).filter(Boolean).sort());

                console.log("Loaded projects from API:", projectData, managers, leads, podLeads, trainers);
                
                // --- process employee names response and split into manager / podLead / trainer lists ---
                const employees = Array.isArray(namesRes?.data) ? namesRes.data : [];

                const managersFromEmployees = Array.from(new Set(
                    employees
                        .filter(e => (e.role_name || "").toLowerCase().includes("manager"))
                        .map(e => e.full_name)
                )).sort();

                const podLeadsFromEmployees = Array.from(new Set(
                    employees
                        .filter(e => (e.role_name || "").toLowerCase().includes("pod lead"))
                        .map(e => e.full_name)
                )).sort();

                // "apart from manager all in trainer" -> include every name whose role is NOT 'manager'
                const trainersFromEmployees = Array.from(new Set(
                    employees
                        .filter(e => (e.role_name || "").toLowerCase() !== "manager")
                        .map(e => e.full_name)
                )).sort();

                // set component lists used by selects
                setManagersList(managersFromEmployees);
                setPodLeadsList(podLeadsFromEmployees);
                setTrainersList(trainersFromEmployees);
                console.log("Employee names:", employees, managersFromEmployees, podLeadsFromEmployees, trainersFromEmployees);
                
                
            } catch (err) {
                console.error("Failed loading projects or employee names", err);
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);


    // ---- derived: filtered + sorted ----
    const filtered = useMemo(() => {
        let d = [...rows];
        if (q.trim()) d = d.filter(r => r.name.toLowerCase().includes(q.trim().toLowerCase()));
        if (fManager !== "All Managers") d = d.filter(r => r.manager === fManager);
        if (fLead !== "All Leads") d = d.filter(r => r.lead === fLead);
        if (fPodLead !== "All Pod Leads") d = d.filter(r => r.podLead === fPodLead);
        if (fTrainer !== "All Trainers") d = d.filter(r => r.trainer === fTrainer);
        if (from) d = d.filter(r => r.start >= from);
        // if (to) d = d.filter(r => r.start <= to);

        d.sort((a, b) => {
            const A = (a[sortKey] ?? "").toString().toLowerCase();
            const B = (b[sortKey] ?? "").toString().toLowerCase();
            if (A < B) return sortDir === "asc" ? -1 : 1;
            if (A > B) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return d;
    }, [rows, q, fManager, fLead, fPodLead, fTrainer, from, to, sortKey, sortDir]);

    // ---- helpers ----
    const resetFilters = () => {
        setQ(""); setFManager("All Managers"); setFLead("All Leads"); setFPodLead("All Pod Leads"); setFrom(""); setTo("");
    };

    // const nextId = () => {
    //     const max = rows.reduce((acc, r) => Math.max(acc, parseInt(r.id.replace("GMP", ""), 10)), 0);
    //     const n = String(max + 1).padStart(3, "0");
    //     return `GMP${n}`;
    // };

    // ---- CRUD ----
    const onAddClick = () => {
        setForm({ ...emptyForm });
        setMode("add"); setSubmitted(false);
        setShowModal(true);
    };
    const onEdit = (r) => {
        setForm({ ...r }); setMode("edit"); setSubmitted(false); setShowModal(true);
    };
    const onDelete = async (id) => {
        if (!window.confirm("Delete this project?")) return;
        try {
            // call API to delete
            await deleteProject(id);
            // update local state
            setRows(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            setError("Failed to delete project");
            alert("Failed to delete project");
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

    const onSave = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!isValid) return;

        const payload = {
            project_name: form.name,
            gms_manager: form.manager,
            lead_name: form.lead,
            pod_name: form.podLead,
            trainer_name: form.trainer
        };

        try {
            if (mode === "add") {
                const res = await addProject(payload);
                console.log("Add project response", res);
                
                // prefer API returned project object; fallback to local form data
                const created = res?.data ?? res ?? { ...form, id: form.id || `GMP${Date.now()}` , name: payload.project_name };
                // normalize stored shape to match rows (id, name, manager, lead, podLead, trainer, start)
                const row = {
                    id: created.id ?? created.project_id ?? created.project_id ?? created._id ?? created.projectId ?? created.employees_id ?? form.id,
                    name: created.project_name ?? created.name ?? form.name,
                    manager: created.gms_manager ?? form.manager,
                    lead: created.lead_name ?? form.lead,
                    podLead: created.pod_name ?? form.podLead,
                    trainer: created.trainer_name ?? form.trainer,
                    start: form.start
                };
                setRows(prev => [row, ...prev]);
            } else {
                const res = await updateProject(form.id, payload);
                console.log("Update project response", res);
                // prefer API returned project object; fallback to local form data
                const updated = res?.data ?? res ?? payload;
                setRows(prev => prev.map(r => {
                    if (r.id === form.id) {
                        return {
                            ...r,
                            name: updated.project_name ?? form.name,
                            manager: updated.gms_manager ?? form.manager,
                            lead: updated.lead_name ?? form.lead,
                            podLead: updated.pod_name ?? form.podLead,
                            trainer: updated.trainer_name ?? form.trainer,
                            start: form.start
                        };
                    }
                    return r;
                }));
            }

            setShowModal(false);
        } catch (err) {
            console.error("Save project failed", err);
            setError("Failed to save project");
            alert("Failed to save project");
        }
    };

    const normalize = (s) => s?.replace("T", " ").replace("Z", "") || "";

    // Display Date as DD-MM-YYYY
    const toYMD = (ymd) => {
        ymd =normalize(ymd);
        return ymd ? ymd.slice(0, 10) : "";
    };
    const toDMY = (dmy) => {
        dmy = normalize(dmy);
        if (!dmy) return "";
        const [y, m, d] = dmy.split(" ")[0].split("-");
        return (d && m && y) ? `${d}-${m}-${y}` : dmy;
    };

    // ---- view ----
    if (loading) {
        return (
            <AppLayout>
                <div className="projects-page">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <div className="projects-page">
                    <div className="alert alert-danger my-4">{error}</div>
                </div>
            </AppLayout>
        );
    }
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

                            <select className="form-select filter-item" value={fPodLead} onChange={(e) => setFPodLead(e.target.value)}>
                                <option>All Pod Leads</option>
                                {podLeads.map(m => <option key={m}>{m}</option>)}
                            </select>

                            <select className="form-select filter-item" value={fTrainer} onChange={(e) => setFTrainer(e.target.value)}>
                                <option>All Trainers</option>
                                {trainers.map(m => <option key={m}>{m}</option>)}
                            </select>

                            <input type="date" className="form-control filter-item" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From Date" />
                            {/* <input type="date" className="form-control filter-item" value={to} onChange={(e) => setTo(e.target.value)} placeholder="To Date" /> */}

                            <button className="btn btn-outline-secondary filter-item" onClick={resetFilters}>
                                <i className="bi bi-arrow-counterclockwise me-1" /> Reset
                            </button>
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
                                                        <label className="form-label">GMS Manager Name <span className="text-danger">*</span></label>
                                                        <input
                                                            list="managersList"
                                                            className={`form-control ${submitted && errors.manager ? "is-invalid" : ""}`}
                                                            placeholder="Enter GMS manager name"
                                                            value={form.manager}
                                                            onChange={(e) => setForm({ ...form, manager: e.target.value })}
                                                        />
                                                        <datalist id="managersList">
                                                            {managersList.map((name) => (
                                                                <option key={name} value={name} />
                                                            ))}
                                                        </datalist>
                                                        {submitted && errors.manager && <div className="invalid-feedback">{errors.manager}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-3">
                                                        <label className="form-label">Turing Manager Name <span className="text-danger">*</span></label>
                                                        <input
                                                            className={`form-control ${submitted && errors.lead ? "is-invalid" : ""}`}
                                                            placeholder="Enter Turing Manager name"
                                                            value={form.lead}
                                                            onChange={(e) => setForm({ ...form, lead: e.target.value })}
                                                        />
                                                        {submitted && errors.lead && <div className="invalid-feedback">{errors.lead}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-3">
                                                        <label className="form-label">Pod Lead Name <span className="text-danger">*</span></label>
                                                        <input
                                                            list="podLeadsList"
                                                            className={`form-control ${submitted && errors.podLead ? "is-invalid" : ""}`}
                                                            placeholder="Enter Pod Lead name"
                                                            value={form.podLead}
                                                            onChange={(e) => setForm({ ...form, podLead: e.target.value })}
                                                        />
                                                        <datalist id="podLeadsList">
                                                            {podLeadsList.map((name) => (
                                                                <option key={name} value={name} />
                                                            ))}
                                                        </datalist>
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
                                                            {trainersList.map(m => <option key={m}>{m}</option>)}
                                                        </select>
                                                        {submitted && errors.trainer && <div className="invalid-feedback">{errors.trainer}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Start Date <span className="text-danger">*</span></label>
                                                        <input
                                                            type="date"
                                                            className={`form-control ${submitted && errors.start ? "is-invalid" : ""}`}
                                                            value={from.start}
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
