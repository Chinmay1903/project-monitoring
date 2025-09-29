import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import "./ResourceList.css";
import { getRoles, getEmployees, addEmployee, updateEmployee, deleteEmployee } from "../../../api/features";

export default function ResourceList() {
    const [roles, setRoles] = useState([]);
    const [roleFilter, setRoleFilter] = useState(["All"]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ---------- defaults ----------
    const emptyForm = {
        id: "", name: "", role: "", gender: "", email: "", mobile: "",
        designation: "", skill: "", exp: "", qualification: "",
        state: "", city: "", start: ""
    };

    // ---------- fetch ----------
    useEffect(() => {
        (async () => {
            try {
                const roleRes = await getRoles();
                const list = roleRes?.data || [];
                setRoles(list);
                setRoleFilter(["All", ...list.map(r => r.role_name)]);
            } catch (e) { console.error("roles", e); }
            try {
                setLoading(true);
                const resp = await getEmployees();
                const data = (resp?.data || []).map(emp => ({
                    ...emptyForm,
                    id: emp.employees_id,
                    name: (emp.first_name || "") + (emp.last_name ? ` ${emp.last_name}` : ""),
                    role: emp.role,
                    roleName: emp.role_name,
                    gender: emp.gender,
                    email: emp.email,
                    mobile: emp.phone,
                    designation: emp.designation,
                    skill: emp.skill,
                    exp: emp.experience,
                    qualification: emp.qualification,
                    state: emp.state,
                    city: emp.city,
                    start: emp.create_at?.split(" ")[0] || "",
                }));
                setRows(data);
            } catch (e) {
                console.error("employees", e);
                setError("Failed to load employees");
            } finally { setLoading(false); }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- filters ----------
    const [roleTab, setRoleTab] = useState("All");
    const [q, setQ] = useState("");

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
        const max = rows.reduce((acc, r) =>
            Math.max(acc, parseInt(String(r.id || "").replace("GMS", ""), 10) || 0), 0);
        return `GMS${String(max + 1).padStart(3, "0")}`;
    };

    const onAdd = () => {
        setForm({ ...emptyForm, id: nextId(), start: todayYMD });
        setMode("add"); setSubmitted(false); setShowModal(true);
    };
    const onEdit = (r) => { setForm({ ...emptyForm, ...r }); setMode("edit"); setSubmitted(false); setShowModal(true); };
    const onDelete = async (id) => {
        if (!window.confirm("Delete this resource?")) return;
        try {
            const res = await deleteEmployee(id);
            if (res?.data) setRows(prev => prev.filter(x => x.id !== id));
        } catch (e) { console.error(e); alert("Failed to delete employee. Please try again."); }
    };

    // ---------- validation ----------
    const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
    const mobileOk = v => /^[0-9]{10,12}$/.test(v || "");
    const errors = useMemo(() => {
        const e = {};
        if (!form.id) e.id = "ID is required.";
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

    const onSave = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!isValid) return;
        const parts = form.name.split(" ");
        const last = parts.length > 1 ? parts.pop() : "";
        const first = parts.join(" ");
        try {
            if (mode === "add") {
                const res = await addEmployee({
                    employees_id: form.id, first_name: first, last_name: last,
                    role: form.role,
                    role_name: roles.find(r => r.role_id === form.role)?.role_name || "",
                    gender: form.gender, email: form.email, phone: form.mobile,
                    designation: form.designation, skill: form.skill, experience: form.exp,
                    qualification: form.qualification, state: form.state, city: form.city,
                    status: "1", create_at: form.start,
                });
                if (res?.data) { setRows(prev => [{ ...form }, ...prev]); setShowModal(false); }
            } else {
                const res = await updateEmployee(form.id, {
                    first_name: first, last_name: last, role: form.role, gender: form.gender,
                    email: form.email, phone: form.mobile, designation: form.designation,
                    skill: form.skill, experience: form.exp, qualification: form.qualification,
                    state: form.state, city: form.city, status: "1",
                });
                if (res?.data) { setRows(prev => prev.map(r => r.id === form.id ? { ...r, ...form } : r)); setShowModal(false); }
            }
        } catch (err) { console.error(err); alert("Failed to save employee. Please try again."); }
    };

    // ---------- derived ----------
    const filtered = useMemo(() => {
        let d = [...rows];
        if (roleTab !== "All") d = d.filter(r => r.roleName === roleTab);
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

    // ---------- header cell ----------
    const Th = ({ label, k }) => {
        const active = sortKey === k;
        const icon = active ? (sortDir === "asc" ? "bi-caret-up-fill" : "bi-caret-down-fill") : "bi-arrow-down-up";
        return (
            <th className={`sortable ${active ? "active" : ""}`}>
                <button type="button" className="sort-btn" onClick={() => toggleSort(k)} title={`Sort by ${label}`}>
                    {label} <i className={`bi ${icon} sort-icon`} />
                </button>
            </th>
        );
    };

    // ---------- view ----------
    if (loading) {
        return (
            <AppLayout>
                <div className="p-3 text-center">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            </AppLayout>
        );
    }
    if (error) {
        return (
            <AppLayout>
                <div className="p-3"><div className="alert alert-danger">{error}</div></div>
            </AppLayout>
        );
    }

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
            <div className="rl-scope px-2 py-2">
                {/* Add button (icon-first) */}
                <div className="d-flex justify-content-end mb-2">
                    <button className="btn btn-primary action-btn" onClick={onAdd}>
                        <i className="bi bi-plus-circle" />
                        <span className="label">Add User</span>
                    </button>
                </div>

                {/* Card */}
                <div className="card bg-body-tertiary border-3 rounded-3 shadow">
                    <div className="card-header bg-warning-subtle text-warning-emphasis">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <h5 className="mb-0">Resources</h5>
                                <div className="btn-group" role="group" aria-label="role filter">
                                    {roleFilter.map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            className={`btn btn-sm ${roleTab === role ? "btn-outline-danger active" : "btn-outline-secondary"}`}
                                            aria-pressed={roleTab === role}
                                            onClick={() => setRoleTab(role)}
                                        >
                                            {role === "All" ? "All" : role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group" style={{ maxWidth: 360 }}>
                                <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
                                <input type="text" className="form-control" placeholder="Search name / id / email" value={q} onChange={e => setQ(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive bg-warning-subtle text-warning-emphasis rounded shadow">
                        <table className="table table-info table-striped-columns table-hover align-middle mb-0 has-actions">
                            <thead className="table-success">
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
                                    <th className="actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id}>
                                        <td className="text-muted">{r.id}</td>
                                        <td className="fw-semibold">{r.name}</td>
                                        <td>{r.roleName}</td>
                                        <td>{r.gender || "-"}</td>
                                        <td><span className="text-break d-inline-block" style={{ maxWidth: 220 }}>{r.email}</span></td>
                                        <td>{r.mobile}</td>
                                        <td>{r.designation}</td>
                                        <td>{r.skill}</td>
                                        <td>{r.exp}</td>
                                        <td>{r.start}</td>
                                        <td className="actions-col">
                                            <div className="action-wrap">
                                                <button className="btn btn-outline-secondary btn-sm action-btn" onClick={() => onEdit(r)} title="Edit">
                                                    <i className="bi bi-pencil-square" /><span className="label">Edit</span>
                                                </button>
                                                <button className="btn btn-outline-danger btn-sm action-btn" onClick={() => onDelete(r.id)} title="Delete">
                                                    <i className="bi bi-trash3" /><span className="label">Delete</span>
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

                {/* Modal */}
                {showModal && (
                    <>
                        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                            <div className="modal-dialog modal-xl modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header border-0 border-bottom">
                                        <h5 className="modal-title">{mode === "add" ? "Add Resource" : "Edit Resource"}</h5>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)} />
                                    </div>

                                    <form onSubmit={onSave} noValidate>
                                        <div className="modal-body">
                                            <div className="container-fluid">
                                                <div className="row g-3">
                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">GMS ID <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.id ? "is-invalid" : ""}`}
                                                            placeholder="GMS ID"
                                                            value={form.id}
                                                            disabled={mode === "edit"}
                                                            onChange={e => setForm({ ...form, id: e.target.value })} />
                                                        {submitted && errors.id && <div className="invalid-feedback">{errors.id}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Role <span className="text-danger">*</span></label>
                                                        <select className={`form-select ${submitted && errors.role ? "is-invalid" : ""}`}
                                                            value={form.role}
                                                            onChange={e => setForm({ ...form, role: e.target.value })}>
                                                            <option value="">Select role</option>
                                                            {roles.map(role => (
                                                                <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                                                            ))}
                                                        </select>
                                                        {submitted && errors.role && <div className="invalid-feedback">{errors.role}</div>}
                                                    </div>

                                                    <div className="col-12">
                                                        <label className="form-label">Name <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.name ? "is-invalid" : ""}`}
                                                            placeholder="Resource Name"
                                                            value={form.name}
                                                            onChange={e => setForm({ ...form, name: e.target.value })} />
                                                        {submitted && errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Gender <span className="text-danger">*</span></label>
                                                        <select className={`form-select ${submitted && errors.gender ? "is-invalid" : ""}`}
                                                            value={form.gender}
                                                            onChange={e => setForm({ ...form, gender: e.target.value })}>
                                                            <option value="">Select gender</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                        {submitted && errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Email <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.email ? "is-invalid" : ""}`}
                                                            placeholder="resource@example.com"
                                                            value={form.email}
                                                            onChange={e => setForm({ ...form, email: e.target.value })} />
                                                        {submitted && errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Mobile <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.mobile ? "is-invalid" : ""}`}
                                                            placeholder="10 digits"
                                                            value={form.mobile}
                                                            onChange={e => setForm({ ...form, mobile: e.target.value })} />
                                                        {submitted && errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Designation <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.designation ? "is-invalid" : ""}`}
                                                            placeholder="e.g., Developer"
                                                            value={form.designation}
                                                            onChange={e => setForm({ ...form, designation: e.target.value })} />
                                                        {submitted && errors.designation && <div className="invalid-feedback">{errors.designation}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Skill <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.skill ? "is-invalid" : ""}`}
                                                            placeholder="e.g., JavaScript"
                                                            value={form.skill}
                                                            onChange={e => setForm({ ...form, skill: e.target.value })} />
                                                        {submitted && errors.skill && <div className="invalid-feedback">{errors.skill}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Experience <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.exp ? "is-invalid" : ""}`}
                                                            placeholder="e.g., 3 years"
                                                            value={form.exp}
                                                            onChange={e => setForm({ ...form, exp: e.target.value })} />
                                                        {submitted && errors.exp && <div className="invalid-feedback">{errors.exp}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Qualification</label>
                                                        <input className="form-control"
                                                            placeholder="e.g., Bachelor's Degree"
                                                            value={form.qualification}
                                                            onChange={e => setForm({ ...form, qualification: e.target.value })} />
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">State</label>
                                                        <input className="form-control"
                                                            placeholder="e.g., Texas"
                                                            value={form.state}
                                                            onChange={e => setForm({ ...form, state: e.target.value })} />
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">City</label>
                                                        <input className="form-control"
                                                            placeholder="e.g., Houston"
                                                            value={form.city}
                                                            onChange={e => setForm({ ...form, city: e.target.value })} />
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Start Date <span className="text-danger">*</span></label>
                                                        <input type="date" className={`form-control ${submitted && errors.start ? "is-invalid" : ""}`}
                                                            value={toDMY(form.start)}
                                                            onChange={e => setForm({ ...form, start: e.target.value })} />
                                                        {submitted && errors.start && <div className="invalid-feedback">{errors.start}</div>}
                                                        <div className="form-text">Default to today; format dd/mm/yyyy ({ddmmyyyy})</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="modal-footer border-0 border-top">
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
