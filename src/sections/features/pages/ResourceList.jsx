import React, { useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import "./ResourceList.css";

export default function ResourceList() {
    // ---------- defaults for ALL fields ----------
    const emptyForm = {
        id: "",
        name: "",
        role: "",
        gender: "",
        email: "",
        mobile: "",
        designation: "",
        skill: "",
        exp: "",
        qualification: "",
        state: "",
        city: "",
        start: "",
    };

    // ---------- demo rows (include qualification/state/city) ----------
    const seed = [
        { id: "GMS101", name: "Asha Kumar", role: "Manager", gender: "Female", email: "asha.k@example.com", mobile: "8011223344", designation: "Developer", skill: "JavaScript", exp: "3 years", qualification: "B.Tech", state: "Karnataka", city: "Bengaluru", start: "2025-08-01" },
        { id: "GMS102", name: "Rahul Shah", role: "Trainer", gender: "Male", email: "rahul.s@example.com", mobile: "8122334455", designation: "QA", skill: "Selenium", exp: "2 years", qualification: "B.Sc", state: "Maharashtra", city: "Mumbai", start: "2025-07-22" },
        { id: "GMS103", name: "Ishita Bose", role: "Pod Lead", gender: "Female", email: "ishita.b@example.com", mobile: "8233445566", designation: "Analyst", skill: "SQL", exp: "4 years", qualification: "MCA", state: "WB", city: "Kolkata", start: "2025-06-15" },
        { id: "GMS104", name: "Vikram Patel", role: "Trainer", gender: "Male", email: "vikram.p@example.com", mobile: "8344556677", designation: "Developer", skill: "C#", exp: "5 years", qualification: "B.E", state: "Gujarat", city: "Ahmedabad", start: "2025-05-05" },
        { id: "GMS105", name: "Neha Das", role: "Reviewer", gender: "Female", email: "neha.d@example.com", mobile: "8455667788", designation: "Sr. Dev", skill: "React", exp: "6 years", qualification: "B.Tech", state: "Delhi", city: "New Delhi", start: "2025-04-18" },
        { id: "GMS106", name: "Ankit Verma", role: "Lead", gender: "Male", email: "ankit.v@example.com", mobile: "8566778899", designation: "Architect", skill: "Azure", exp: "8 years", qualification: "M.Tech", state: "UP", city: "Noida", start: "2025-03-08" },
        { id: "GMS107", name: "Zoya Khan", role: "Trainer", gender: "Female", email: "zoya.k@example.com", mobile: "8677889900", designation: "Developer", skill: "Node.js", exp: "3 years", qualification: "BCA", state: "Telangana", city: "Hyderabad", start: "2025-07-12" },
        { id: "GMS108", name: "Arjun Menon", role: "Reviewer", gender: "Male", email: "arjun.m@example.com", mobile: "8788990011", designation: "Lead QA", skill: "Cypress", exp: "7 years", qualification: "B.Tech", state: "Kerala", city: "Kochi", start: "2025-01-30" },
        { id: "GMS109", name: "Priya Singh", role: "Lead", gender: "Female", email: "priya.s@example.com", mobile: "8899001122", designation: "Analyst", skill: "Power BI", exp: "2 years", qualification: "MBA", state: "Rajasthan", city: "Jaipur", start: "2025-08-19" },
        { id: "GMS110", name: "Rohan Iyer", role: "Reviewer", gender: "Male", email: "rohan.i@example.com", mobile: "9001122334", designation: "Dev Lead", skill: ".NET", exp: "9 years", qualification: "B.E", state: "TN", city: "Chennai", start: "2024-12-11" },
        { id: "GMS111", name: "Meera Nair", role: "Trainer", gender: "Female", email: "meera.n@example.com", mobile: "9112233445", designation: "Developer", skill: "Angular", exp: "4 years", qualification: "M.Sc", state: "Kerala", city: "Trivandrum", start: "2025-06-01" },
        { id: "GMS112", name: "Sanjay Patel", role: "Pod Lead", gender: "Male", email: "sanjay.p@example.com", mobile: "9223344556", designation: "Architect", skill: "GCP", exp: "10 years", qualification: "B.Tech", state: "Maharashtra", city: "Pune", start: "2024-11-20" },
    ];

    // Normalize rows so missing keys default to ""
    const [rows, setRows] = useState(() => seed.map(r => ({ ...emptyForm, ...r })));

    // ---------- filters ----------
    const [roleTab, setRoleTab] = useState("All"); // All | Reviewers | Trainer
    const [q, setQ] = useState("");
    const clearFilters = () => { setRoleTab("All"); setQ(""); };

    // ---------- sort ----------
    const [sortKey, setSortKey] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    // ---------- modal ----------
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("add");
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const todayYMD = new Date().toISOString().slice(0, 10);
    const ddmmyyyy = `${todayYMD.slice(8, 10)}/${todayYMD.slice(5, 7)}/${todayYMD.slice(0, 4)}`;

    const nextId = () => {
        const max = rows.reduce((acc, r) => Math.max(acc, parseInt(r.id.replace("GMS", ""), 10)), 0);
        return `GMS${String(max + 1).padStart(3, "0")}`;
    };

    const onAdd = () => {
        setForm({ ...emptyForm, id: nextId(), start: todayYMD });
        setMode("add"); setSubmitted(false); setShowModal(true);
    };

    const onEdit = (r) => {
        // <-- KEY FIX: merge with emptyForm so any missing keys get defaults
        setForm({ ...emptyForm, ...r });
        setMode("edit"); setSubmitted(false); setShowModal(true);
    };

    const onDelete = (id) => {
        if (window.confirm("Delete this resource?")) setRows(prev => prev.filter(r => r.id !== id));
    };

    // ---------- validation ----------
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
    const mobileOk = (v) => /^[0-9]{10,12}$/.test(v || "");
    const errors = useMemo(() => {
        const e = {};
        if (!form.role) e.role = "Role is required.";
        if (!form.gender) e.gender = "Gender is required.";
        if (!form.name.trim()) e.name = "Name is required.";
        if (!form.email) e.email = "Email is required.";
        else if (!emailOk(form.email)) e.email = "Enter a valid email.";
        if (!form.mobile) e.mobile = "Mobile is required.";
        else if (!mobileOk(form.mobile)) e.mobile = "10–12 digits.";
        if (!form.designation) e.designation = "Designation is required.";
        if (!form.skill) e.skill = "Skill is required.";
        if (!form.exp) e.exp = "Experience is required.";
        if (!form.start) e.start = "Start date is required.";
        return e;
    }, [form]);
    const isValid = Object.keys(errors).length === 0;

    const onSave = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!isValid) return;
        if (mode === "add") setRows(prev => [{ ...form }, ...prev]);
        else setRows(prev => prev.map(r => r.id === form.id ? { ...r, ...form } : r));
        setShowModal(false);
    };

    // ---------- derived ----------
    const filtered = useMemo(() => {
        let d = [...rows];
        if (roleTab === "Trainer") d = d.filter(r => r.role === "Trainer");
        if (roleTab === "Reviewers") d = d.filter(r => r.role === "Reviewer");
        if (roleTab === "Manager") d = d.filter(r => r.role === "Manager");
        if (roleTab === "Pod Lead") d = d.filter(r => r.role === "Pod Lead");
        if (roleTab === "Lead") d = d.filter(r => r.role === "Lead");
        if (q.trim()) {
            const qq = q.trim().toLowerCase();
            d = d.filter(r =>
                r.id.toLowerCase().includes(qq) ||
                r.name.toLowerCase().includes(qq) ||
                r.email.toLowerCase().includes(qq)
            );
        }
        d.sort((a, b) => {
            const A = (a[sortKey] ?? "").toString().toLowerCase();
            const B = (b[sortKey] ?? "").toString().toLowerCase();
            if (A < B) return sortDir === "asc" ? -1 : 1;
            if (A > B) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return d;
    }, [rows, roleTab, q, sortKey, sortDir]);

    // ---------- tiny header cell helper ----------
    const Th = ({ label, k }) => {
        const active = sortKey === k;
        return (
            <th role="button" onClick={() => toggleSort(k)}>
                <span className="me-1">{label}</span>
                <span className={"sort " + (active ? sortDir : "")}>
                    <i className="bi bi-arrow-down-up" />
                </span>
            </th>
        );
    };

    // ---------- view ----------
    return (
        <AppLayout>
            <div className="resources-page">
                <div className="resources-actions d-flex justify-content-end">
                    <button className="btn btn-primary" onClick={onAdd}>
                        <i className="bi bi-plus-lg me-1" />
                        Add User
                    </button>
                </div>
                <div className="resources-card card shadow-sm">
                    <div className="resources-toolbar">
                        <div className="left">
                            <span className="title">Resources</span>

                            <div className="btn-group" role="group" aria-label="role filter">
                                <button type="button"
                                    className={"btn btn-outline-primary " + (roleTab === "All" ? "active" : "")}
                                    onClick={() => setRoleTab("All")}>
                                    All
                                </button>
                                <button type="button"
                                    className={"btn btn-outline-primary " + (roleTab === "Manager" ? "active" : "")}
                                    onClick={() => setRoleTab("Manager")}>
                                    Managers
                                </button>
                                <button type="button"
                                    className={"btn btn-outline-primary " + (roleTab === "Pod Lead" ? "active" : "")}
                                    onClick={() => setRoleTab("Pod Lead")}>
                                    Pod Leads
                                </button>
                                <button type="button"
                                    className={"btn btn-outline-primary " + (roleTab === "Lead" ? "active" : "")}
                                    onClick={() => setRoleTab("Lead")}>
                                    Leads
                                </button>
                                <button type="button"
                                    className={"btn btn-outline-primary " + (roleTab === "Reviewers" ? "active" : "")}
                                    onClick={() => setRoleTab("Reviewers")}>
                                    Reviewers
                                </button>
                                <button type="button"
                                    className={"btn btn-outline-primary " + (roleTab === "Trainer" ? "active" : "")}
                                    onClick={() => setRoleTab("Trainer")}>
                                    Trainers
                                </button>
                            </div>

                            {/* <button type="button" className="btn btn-outline-secondary btn-sm ms-2" onClick={clearFilters}>
                                <i className="bi bi-x-circle me-1" /> Clear
                            </button> */}
                        </div>

                        <div className="right">
                            <div className="input-group search">
                                <span className="input-group-text"><i className="bi bi-search" /></span>
                                <input className="form-control"
                                    placeholder="Search name / id / email"
                                    value={q}
                                    onChange={e => setQ(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover resources-table">
                            <thead>
                                <tr>
                                    <Th label="ID" k="id" />
                                    <Th label="Name" k="name" />
                                    <Th label="Role" k="role" />
                                    <Th label="Gender" k="gender" />
                                    <Th label="Email" k="email" />
                                    <Th label="Mobile" k="mobile" />
                                    <Th label="Designation" k="designation" />
                                    <Th label="Skill" k="skill" />
                                    <Th label="Exp" k="exp" />
                                    <Th label="Start Date" k="start" />
                                    <th style={{ width: 110 }} className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id}>
                                        <td className="text-muted">{r.id}</td>
                                        {/* <td className="fw-semibold"><a href="#0" className="name-link">{r.name}</a></td> */}
                                        <td className="fw-semibold">{r.name}</td>
                                        <td>{r.role}</td>
                                        <td>{r.gender}</td>
                                        <td className="email-cell"><span>{r.email}</span></td>
                                        <td>{r.mobile}</td>
                                        <td>{r.designation}</td>
                                        <td>{r.skill}</td>
                                        <td>{r.exp}</td>
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
                                    <tr><td colSpan={11} className="text-center py-4 text-muted">No resources match the filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit modal */}
                {showModal && (
                    <>
                        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                            <div className="modal-dialog modal-xl modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{mode === "add" ? "Add User" : "Edit User"}</h5>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)} />
                                    </div>

                                    <form onSubmit={onSave} noValidate>
                                        <div className="modal-body">
                                            <div className="container-fluid">
                                                <div className="row g-3">
                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Role <span className="text-danger">*</span></label>
                                                        <select className={`form-select ${submitted && errors.role ? "is-invalid" : ""}`}
                                                            value={form.role}
                                                            onChange={e => setForm({ ...form, role: e.target.value })}>
                                                            <option value="">Select role</option>
                                                            <option>Trainer</option>
                                                            <option>Reviewer</option>
                                                        </select>
                                                        {submitted && errors.role && <div className="invalid-feedback">{errors.role}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Gender <span className="text-danger">*</span></label>
                                                        <select className={`form-select ${submitted && errors.gender ? "is-invalid" : ""}`}
                                                            value={form.gender}
                                                            onChange={e => setForm({ ...form, gender: e.target.value })}>
                                                            <option value="">Select gender</option>
                                                            <option>Female</option>
                                                            <option>Male</option>
                                                            <option>Other</option>
                                                        </select>
                                                        {submitted && errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Name <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.name ? "is-invalid" : ""}`}
                                                            placeholder="Resource Name"
                                                            value={form.name}
                                                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                                        {submitted && errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Email <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.email ? "is-invalid" : ""}`}
                                                            placeholder="resource@example.com"
                                                            value={form.email}
                                                            onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                                        {submitted && errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Mobile <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.mobile ? "is-invalid" : ""}`}
                                                            placeholder="10 digits"
                                                            value={form.mobile}
                                                            onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                                                        {submitted && errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Designation <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.designation ? "is-invalid" : ""}`}
                                                            placeholder="e.g., Developer"
                                                            value={form.designation}
                                                            onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                                                        {submitted && errors.designation && <div className="invalid-feedback">{errors.designation}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Skill <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.skill ? "is-invalid" : ""}`}
                                                            placeholder="e.g., JavaScript"
                                                            value={form.skill}
                                                            onChange={(e) => setForm({ ...form, skill: e.target.value })} />
                                                        {submitted && errors.skill && <div className="invalid-feedback">{errors.skill}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Experience <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.exp ? "is-invalid" : ""}`}
                                                            placeholder="e.g., 3 years"
                                                            value={form.exp}
                                                            onChange={(e) => setForm({ ...form, exp: e.target.value })} />
                                                        {submitted && errors.exp && <div className="invalid-feedback">{errors.exp}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Qualification</label>
                                                        <input className="form-control"
                                                            placeholder="e.g., Bachelor's Degree"
                                                            value={form.qualification}
                                                            onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">State</label>
                                                        <input className="form-control"
                                                            placeholder="e.g., Texas"
                                                            value={form.state}
                                                            onChange={(e) => setForm({ ...form, state: e.target.value })} />
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">City</label>
                                                        <input className="form-control"
                                                            placeholder="e.g., Houston"
                                                            value={form.city}
                                                            onChange={(e) => setForm({ ...form, city: e.target.value })} />
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Start Date <span className="text-danger">*</span></label>
                                                        <input type="date"
                                                            className={`form-control ${submitted && errors.start ? "is-invalid" : ""}`}
                                                            value={form.start}
                                                            onChange={(e) => setForm({ ...form, start: e.target.value })} />
                                                        {submitted && errors.start && <div className="invalid-feedback">{errors.start}</div>}
                                                        <div className="form-text">Default to today; format dd/mm/yyyy ({ddmmyyyy})</div>
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
