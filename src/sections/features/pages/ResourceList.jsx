import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import "./ResourceList.css";
import { getRoles, getEmployees, addEmployee, updateEmployee, deleteEmployee } from "../../../api/features";

export default function ResourceList() {
    const [roles, setRoles] = useState([]); 
    const [roleFilter, setRoleFilter] = useState(["All"]); // Initialize with "All"
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add this useEffect to fetch roles when component mounts
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await getRoles();
                console.log("Fetched roles:", rolesData);
                setRoles(rolesData.data || []);
                const roleNames = rolesData.data.map(role => role.role_name);
                setRoleFilter(["All", ...roleNames ]); // Add "All" to beginning of roles array
                console.log("Fetched roles:", setRoleFilter, setRoles);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await getEmployees();
                const employeeData = response.data.map(emp => ({
                    ...emptyForm,  // Use default values for missing fields
                    id: emp.employees_id,
                    name: (emp.first_name ? emp.first_name : '') + (emp.last_name ? ` ${emp.last_name}` : ''),
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
                    start: emp.create_at?.split(' ')[0] || '', // Take only the date part
                }));
                setRows(employeeData);
            } catch (error) {
                console.error("Error fetching employees:", error);
                setError("Failed to load employees");
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
        fetchEmployees();
    }, []);

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

    // ---------- filters ----------
    const [roleTab, setRoleTab] = useState("All"); // All | Reviewers | Trainer
    const [q, setQ] = useState("");
    // const clearFilters = () => { setRoleTab("All"); setQ(""); };

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

    const onDelete = async(id) => {
        if (window.confirm("Delete this resource?")) {
        try {
            const response = await deleteEmployee(id);
            console.log("Delete response:", response);
            
            if (response.data) {
                setRows(prev => prev.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            alert("Failed to delete employee. Please try again.");
        }
    }
    };

    // ---------- validation ----------
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
    const mobileOk = (v) => /^[0-9]{10,12}$/.test(v || "");
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
        const nameParts = form.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts.pop() : ''; // Get last word
        const firstName = nameParts.join(' '); // Join remaining words
        try {
            if (mode === "add") {
                const response = await addEmployee({
                    employees_id: form.id,
                    first_name: firstName,
                    last_name: lastName,
                    role: form.role,
                    role_name: roles.find(r => r.role_id === form.role)?.role_name || "",
                    gender: form.gender,
                    email: form.email,
                    phone: form.mobile,
                    designation: form.designation,
                    skill: form.skill,
                    experience: form.exp,
                    qualification: form.qualification,
                    state: form.state,
                    city: form.city,
                    status: "1",
                    create_at: form.start,
                });

                if (response.data) {
                    setRows(prev => [{ ...form }, ...prev]);
                    setShowModal(false);
                }
            } else {
                const response = await updateEmployee(form.id, {
                    first_name: firstName,
                    last_name: lastName,
                    role: form.role,
                    gender: form.gender,
                    email: form.email,
                    phone: form.mobile,
                    designation: form.designation,
                    skill: form.skill,
                    experience: form.exp,
                    qualification: form.qualification,
                    state: form.state,
                    city: form.city,
                    status: "1"
                });

                if (response.data) {
                    setRows(prev => prev.map(r => r.id === form.id ? { ...r, ...form } : r));
                    setShowModal(false);
                }
            }
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Failed to save employee. Please try again.");
        }
    };

    // ---------- derived ----------
    const filtered = useMemo(() => {
        let d = [...rows];
        if (roleTab !== "All") {
            d = d.filter(r => r.roleName === roleTab);
        }
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
    if (loading) {
        return (
            <AppLayout>
                <div className="resources-page">
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <div className="resources-page">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="resources-page">
                <div className="resources-actions d-flex justify-content-end">
                    <button className="btn btn-primary" onClick={onAdd}>
                        <i className="bi bi-plus-lg me-1" />
                    </button>
                </div>
                <div className="resources-card card shadow-sm">
                    <div className="resources-toolbar">
                        <div className="left">
                            <span className="title">Resources</span>

                            <div className="btn-group" role="group" aria-label="role filter">
                                {roleFilter.map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        className={`btn btn-outline-primary ${roleTab === role ? "active" : ""}`}
                                        onClick={() => setRoleTab(role)}>
                                        {role === "All" ? "All" : `${role}s`}
                                    </button>
                                ))}
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
                                    <Th label="Experience" k="exp" />
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
                                        <td>{r.roleName}</td>
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
                                                            onChange={(e) => setForm({ ...form, id: e.target.value })} />
                                                        {submitted && errors.id && <div className="invalid-feedback">{errors.id}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-6">
                                                        <label className="form-label">Role <span className="text-danger">*</span></label>
                                                        <select className={`form-select ${submitted && errors.role ? "is-invalid" : ""}`}
                                                            value={form.role}
                                                            onChange={e => setForm({ ...form, role: e.target.value })}>
                                                            <option value="">Select role</option>
                                                            {roles.map(role => (
                                                                <option key={role.role_id} value={role.role_id}>
                                                                    {role.role_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {submitted && errors.role && <div className="invalid-feedback">{errors.role}</div>}
                                                    </div>

                                                    <div className="col-12 col-md-12">
                                                        <label className="form-label">Name <span className="text-danger">*</span></label>
                                                        <input className={`form-control ${submitted && errors.name ? "is-invalid" : ""}`}
                                                            placeholder="Resource Name"
                                                            value={form.name}
                                                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
