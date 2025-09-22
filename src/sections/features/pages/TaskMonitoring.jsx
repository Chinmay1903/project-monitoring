import React, { useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import "./TaskMonitoring.css";

/**
 * Task Monitoring (single React function)
 * - Overview: list of task entries (Day/Week/Month/Overall)
 * - Add/Edit modal (trainer+project set manager/lead/pod; hours limited unless overtime)
 * - Click trainer name → Trainer detail view with same chips + charts
 * - Sorting, delete with confirm
 * - Demo data for August 2025
 *
 * Requires recharts:  npm i recharts
 */
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from "recharts";

export default function TaskMonitoring() {
  /* ----------------------------- small helpers ----------------------------- */
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
  const toYMD = (d) => (d instanceof Date ? d.toISOString().slice(0,10) : d);
  const today = toYMD(new Date());

  /* ------------------------------ trainer map ------------------------------ */
  // Projects assigned to each trainer (used by the modal to constrain options)
  const trainerMap = {
    GMS101: {
      name: "Asha Kumar",
      projects: [
        { project:"Inventory Revamp", manager:"N. Gupta",  lead:"S. Rao",   podLead:"M. Iyer" },
        { project:"Partner Portal",   manager:"N. Gupta",  lead:"S. Rao",   podLead:"M. Iyer" },
        { project:"Mobile App v3",    manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan" },
      ],
    },
    GMS102: {
      name: "Rahul Shah",
      projects: [
        { project:"Billing Migration", manager:"N. Gupta",  lead:"P. Mehta", podLead:"M. Iyer" },
        { project:"Fraud Engine",      manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan" },
      ],
    },
    GMS103: {
      name: "Ishita Bose",
      projects: [
        { project:"Mobile App v3",     manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan" },
        { project:"Data Lake ETL",     manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan" },
      ],
    },
  };
  const trainers = Object.entries(trainerMap).map(([id, t]) => ({ id, name: t.name }));

  /* -------------------------------- seed data ------------------------------ */
  const seed = [
    // 2025-08-29 (from your screenshot)
    { id:"t1", date:"2025-08-29", trainerId:"GMS101", trainer:"Asha Kumar",  project:"Inventory Revamp", manager:"N. Gupta",  lead:"S. Rao",   podLead:"M. Iyer", hours:6, newTask:6, reworked:2, prPassed:2, approved:2 },
    { id:"t2", date:"2025-08-29", trainerId:"GMS101", trainer:"Asha Kumar",  project:"Partner Portal",   manager:"N. Gupta",  lead:"S. Rao",   podLead:"M. Iyer", hours:2, newTask:3, reworked:1, prPassed:1, approved:1 },
    { id:"t3", date:"2025-08-29", trainerId:"GMS102", trainer:"Rahul Shah",  project:"Billing Migration", manager:"N. Gupta", lead:"P. Mehta", podLead:"M. Iyer", hours:4, newTask:4, reworked:1, prPassed:1, approved:1 },
    // a spread across the month for charts/tabs
    { id:"t4", date:"2025-08-05", trainerId:"GMS101", trainer:"Asha Kumar",  project:"Inventory Revamp", manager:"N. Gupta",  lead:"S. Rao",   podLead:"M. Iyer", hours:7, newTask:5, reworked:2, prPassed:2, approved:2 },
    { id:"t5", date:"2025-08-12", trainerId:"GMS101", trainer:"Asha Kumar",  project:"Mobile App v3",    manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan", hours:8, newTask:3, reworked:1, prPassed:1, approved:1 },
    { id:"t6", date:"2025-08-10", trainerId:"GMS102", trainer:"Rahul Shah",  project:"Fraud Engine",     manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan", hours:6, newTask:2, reworked:1, prPassed:1, approved:1 },
    { id:"t7", date:"2025-08-18", trainerId:"GMS102", trainer:"Rahul Shah",  project:"Billing Migration", manager:"N. Gupta", lead:"P. Mehta", podLead:"M. Iyer", hours:5, newTask:4, reworked:0, prPassed:1, approved:1 },
    { id:"t8", date:"2025-08-03", trainerId:"GMS103", trainer:"Ishita Bose", project:"Mobile App v3",    manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan", hours:6, newTask:2, reworked:1, prPassed:1, approved:1 },
    { id:"t9", date:"2025-08-16", trainerId:"GMS103", trainer:"Ishita Bose", project:"Data Lake ETL",    manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan", hours:7, newTask:3, reworked:1, prPassed:1, approved:1 },
    { id:"t10", date:"2025-08-22", trainerId:"GMS103", trainer:"Ishita Bose", project:"Mobile App v3",   manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan", hours:4, newTask:2, reworked:1, prPassed:1, approved:1 },
    // a couple near month end for "week"
    { id:"t11", date:"2025-08-27", trainerId:"GMS101", trainer:"Asha Kumar", project:"Partner Portal",   manager:"N. Gupta",  lead:"S. Rao",   podLead:"M. Iyer", hours:3, newTask:2, reworked:0, prPassed:1, approved:1 },
    { id:"t12", date:"2025-08-28", trainerId:"GMS102", trainer:"Rahul Shah", project:"Fraud Engine",     manager:"L. Kulkarni", lead:"A. Verma", podLead:"Z. Khan", hours:6, newTask:3, reworked:1, prPassed:1, approved:1 },
  ];
  const [rows, setRows] = useState(seed);

  /* --------------------------------- filters -------------------------------- */
  const [range, setRange] = useState("day"); // day | week | month | overall
  const [view, setView] = useState({ type: "overview" }); // {type:"trainer", trainerId, name}
  const anchor = today; // chips are relative to "today" like screenshot

  const isInRange = (ymd) => {
    if (range === "overall") return true;
    const d = new Date(ymd + "T00:00:00");
    const a = new Date(anchor + "T00:00:00");
    if (range === "day") {
      return d.getTime() === a.getTime();
    }
    if (range === "week") {
      const weekAgo = new Date(a); weekAgo.setDate(a.getDate() - 6);
      return d >= weekAgo && d <= a;
    }
    if (range === "month") {
      return d.getMonth() === a.getMonth() && d.getFullYear() === a.getFullYear();
    }
    return true;
  };

  /* --------------------------------- sorting -------------------------------- */
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  /* ---------------------------- modal state/logic ---------------------------- */
  const emptyForm = {
    date: today, trainerId: "", trainer: "",
    project: "", manager: "", lead: "", podLead: "",
    hours: "", overtime: false, newTask: "", reworked: "", prPassed: "", approved: ""
  };
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  const normalize = (f) => ({
    date: f.date || today,
    trainerId: f.trainerId || "",
    trainer: f.trainer || "",
    project: f.project || "",
    manager: f.manager || "",
    lead: f.lead || "",
    podLead: f.podLead || "",
    hours: f.hours ?? "",
    overtime: !!f.overtime,
    newTask: f.newTask ?? "",
    reworked: f.reworked ?? "",
    prPassed: f.prPassed ?? "",
    approved: f.approved ?? ""
  });

  const onAdd = () => {
    setMode("add");
    setForm(normalize(emptyForm));
    setSubmitted(false);
    setShowModal(true);
  };

  const onEdit = (r) => {
    setMode("edit");
    setForm(normalize({ ...r }));
    setSubmitted(false);
    setShowModal(true);
  };

  const onDelete = (id) => {
    if (window.confirm("Delete this entry?")) {
      setRows(prev => prev.filter(r => r.id !== id));
    }
  };

  // When trainer changes → set id and clear project chain
  const onTrainerChange = (trainerId) => {
    const t = trainers.find(x => x.id === trainerId);
    setForm(f => ({
      ...f,
      trainerId,
      trainer: t ? t.name : "",
      project: "",
      manager: "", lead: "", podLead: ""
    }));
  };

  // When project changes → set manager/lead/pod
  const onProjectChange = (project) => {
    const t = trainerMap[form.trainerId];
    const found = t?.projects.find(p => p.project === project);
    setForm(f => ({
      ...f,
      project,
      manager: found?.manager || "",
      lead: found?.lead || "",
      podLead: found?.podLead || ""
    }));
  };

  // available projects (exclude ones already entered for that trainer + date)
  const availableProjects = useMemo(() => {
    const base = trainerMap[form.trainerId]?.projects || [];
    const taken = rows
      .filter(r => r.trainerId === form.trainerId && r.date === form.date && (mode === "add" || r.id !== form.id))
      .map(r => r.project);
    return base.filter(p => !taken.includes(p.project));
  }, [form.trainerId, form.date, rows, mode, form.id]);

  /* -------------------------------- validation ------------------------------- */
  const hoursNum = Number(form.hours || 0);
  const numOk = (v) => v === "" || /^[0-9]+$/.test(String(v));
  const errors = useMemo(() => {
    const e = {};
    if (!form.trainerId) e.trainerId = "Trainer is required.";
    if (!form.project)   e.project   = "Project is required.";
    if (!form.date)      e.date      = "Date is required.";
    if (form.hours === "" || isNaN(hoursNum)) e.hours = "Hours are required.";
    else if (!form.overtime && hoursNum > 8) e.hours = "Max 8 hrs unless Overtime is checked.";
    if (!numOk(form.newTask))  e.newTask  = "Digits only.";
    if (!numOk(form.reworked)) e.reworked = "Digits only.";
    if (!numOk(form.prPassed)) e.prPassed = "Digits only.";
    if (!numOk(form.approved)) e.approved = "Digits only.";
    return e;
  }, [form, hoursNum]);

  const onSave = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;

    // create/update
    if (mode === "add") {
      const id = "t" + Math.random().toString(36).slice(2,8);
      setRows(prev => [
        { id, ...form, hours: Number(form.hours || 0), newTask: Number(form.newTask || 0), reworked: Number(form.reworked || 0), prPassed: Number(form.prPassed || 0), approved: Number(form.approved || 0) },
        ...prev
      ]);
    } else {
      setRows(prev => prev.map(r => r.id === form.id
        ? { ...form, hours: Number(form.hours || 0), newTask: Number(form.newTask || 0), reworked: Number(form.reworked || 0), prPassed: Number(form.prPassed || 0), approved: Number(form.approved || 0) }
        : r
      ));
    }
    setShowModal(false);
  };

  /* ------------------------------- derived view ------------------------------ */
  const baseRows = useMemo(() => {
    let d = rows.filter(r => isInRange(r.date));
    if (view.type === "trainer") d = d.filter(r => r.trainerId === view.trainerId);
    d.sort((a,b)=>{
      const A = (a[sortKey] ?? "").toString().toLowerCase();
      const B = (b[sortKey] ?? "").toString().toLowerCase();
      const cmp = A < B ? -1 : A > B ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return d;
  }, [rows, view, range, sortKey, sortDir]);

  // aggregates for charts (current filtered scope)
  const agg = useMemo(() => {
    const total = baseRows.reduce((acc, r) => {
      acc.newTask  += Number(r.newTask || 0);
      acc.reworked += Number(r.reworked || 0);
      acc.prPassed += Number(r.prPassed || 0);
      acc.approved += Number(r.approved || 0);
      return acc;
    }, { newTask:0, reworked:0, prPassed:0, approved:0 });

    // hours-by-date for line
    const map = {};
    baseRows.forEach(r => { map[r.date] = (map[r.date] || 0) + Number(r.hours || 0); });
    const days = Object.keys(map).sort();
    const hoursSeries = days.map(d => ({ date: new Date(d).toLocaleDateString("en-US", { month:"short", day:"2-digit" }), hours: map[d] }));

    return { total, hoursSeries };
  }, [baseRows]);

  /* ---------------------------------- view ---------------------------------- */
  return (
    <AppLayout>
      <div className="tasks-page">
        <div className="tasks-actions d-flex justify-content-end">
          <button className="btn btn-primary" onClick={onAdd} title="Add Task">
            <i className="bi bi-plus-lg" />
          </button>
        </div>
        <div className="tasks-card card shadow-sm">
          <div className="tasks-toolbar">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {view.type === "trainer" && (
                <button className="btn btn-light btn-sm me-1" onClick={()=>setView({ type:"overview" })} title="Back">
                  <i className="bi bi-arrow-left" />
                </button>
              )}
              <div className="title">
                {view.type === "trainer"
                  ? <>Trainer: <span className="fw-semibold">{view.name}</span> <span className="text-muted">({view.trainerId})</span></>
                  : <>Task Tracking</>}
              </div>

              <div className="btn-group ms-2" role="group" aria-label="range">
                {["day","week","month","overall"].map(r => (
                  <button
                    key={r}
                    className={"btn btn-outline-secondary btn-sm " + (range===r ? "active" : "")}
                    onClick={()=>setRange(r)}
                    type="button"
                  >
                    {r[0].toUpperCase()+r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="hint small text-muted">
              Track totals per trainer (hours & status). Day shows only today's entries.
            </div>
          </div>

          {/* table */}
          <div className="table-responsive">
            <table className="table table-hover tasks-table">
              <thead>
                <tr>
                  <Th label="Date"       k="date" />
                  <Th label="Trainer (ID)" k="trainer" />
                  <Th label="Project"    k="project" />
                  <Th label="Manager"    k="manager" />
                  <Th label="Lead"       k="lead" />
                  <Th label="Pod Lead"   k="podLead" />
                  <Th label="Hours"      k="hours" />
                  <Th label="New Task"   k="newTask" />
                  <Th label="Reworked"   k="reworked" />
                  <Th label="PR Passed"  k="prPassed" />
                  <Th label="Approved"   k="approved" />
                  <th style={{width:110}} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {baseRows.map(r=>(
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>
                      <a href="#0" className="name-link" onClick={()=>setView({ type:"trainer", trainerId:r.trainerId, name:r.trainer })}>
                        {r.trainer}
                      </a> <span className="text-muted">({r.trainerId})</span>
                    </td>
                    <td>{r.project}</td>
                    <td>{r.manager}</td>
                    <td>{r.lead}</td>
                    <td>{r.podLead}</td>
                    <td>{r.hours}</td>
                    <td className="text-primary fw-semibold">{r.newTask}</td>
                    <td className="text-danger fw-semibold">{r.reworked}</td>
                    <td className="text-info fw-semibold">{r.prPassed}</td>
                    <td className="text-success fw-semibold">{r.approved}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={()=>onEdit(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                        <button className="btn btn-outline-danger" onClick={()=>onDelete(r.id)} title="Delete"><i className="bi bi-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {baseRows.length === 0 && (
                  <tr><td colSpan={12} className="text-center py-4 text-muted">No entries for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* charts (only show when in trainer detail like your 3rd image) */}
        {view.type === "trainer" && (
          <div className="row g-2 mt-2">
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-header"><h6 className="mb-0"># of Tasks by Status — {range[0].toUpperCase()+range.slice(1)}</h6></div>
                <div className="card-body">
                  <div style={{width:"100%", height:260}}>
                    <ResponsiveContainer>
                      <BarChart data={[
                        { status:"New Task",  count: agg.total.newTask },
                        { status:"Reworked",  count: agg.total.reworked },
                        { status:"PR Passed", count: agg.total.prPassed },
                        { status:"Approved",  count: agg.total.approved },
                      ]}>
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#b7d3f9" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-header"><h6 className="mb-0">Monthly Hours</h6></div>
                <div className="card-body">
                  <div style={{width:"100%", height:260}}>
                    <ResponsiveContainer>
                      <LineChart data={agg.hoursSeries}>
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="hours" stroke="#3b81d6" strokeWidth={2} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* modal (single add/edit) */}
        {showModal && (
          <>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
              <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{mode === "add" ? "Add Task Entry" : "Edit Task Entry"}</h5>
                    <button type="button" className="btn-close" onClick={()=>setShowModal(false)} aria-label="Close" />
                  </div>

                  <form onSubmit={onSave} noValidate>
                    <div className="modal-body">
                      <div className="container-fluid">
                        <div className="row g-3">
                          <div className="col-12 col-md-6">
                            <label className="form-label">Trainer Name <span className="text-danger">*</span></label>
                            <select
                              className={`form-select ${submitted && errors.trainerId ? "is-invalid":""}`}
                              value={form.trainerId}
                              onChange={e=>onTrainerChange(e.target.value)}
                            >
                              <option value="">Select trainer</option>
                              {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {submitted && errors.trainerId && <div className="invalid-feedback">{errors.trainerId}</div>}
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label">ID <span className="text-danger">*</span></label>
                            <input className="form-control" value={form.trainerId} disabled />
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label">Project Name <span className="text-danger">*</span></label>
                            <select
                              className={`form-select ${submitted && errors.project ? "is-invalid":""}`}
                              value={form.project}
                              onChange={e=>onProjectChange(e.target.value)}
                              disabled={!form.trainerId}
                            >
                              <option value="">{form.trainerId ? "Select project" : "Select trainer first"}</option>
                              {availableProjects.map(p => <option key={p.project} value={p.project}>{p.project}</option>)}
                            </select>
                            {submitted && errors.project && <div className="invalid-feedback">{errors.project}</div>}
                            <div className="form-text">Shows only projects assigned to the selected trainer, excluding projects already entered for the chosen date.</div>
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label">Manager <span className="text-danger">*</span></label>
                            <input className="form-control bg-light" value={form.manager} disabled />
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label">Lead <span className="text-danger">*</span></label>
                            <input className="form-control bg-light" value={form.lead} disabled />
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label">Pod Lead <span className="text-danger">*</span></label>
                            <input className="form-control bg-light" value={form.podLead} disabled />
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label">Date <span className="text-danger">*</span></label>
                            <input
                              type="date"
                              className={`form-control ${submitted && errors.date ? "is-invalid":""}`}
                              value={form.date}
                              onChange={e=>setForm(f=>({ ...f, date:e.target.value }))}
                            />
                            {submitted && errors.date && <div className="invalid-feedback">{errors.date}</div>}
                          </div>

                          <div className="col-12 col-md-6">
                            <label className="form-label">Hours Worked <span className="text-danger">*</span></label>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                className={`form-control ${submitted && errors.hours ? "is-invalid":""}`}
                                value={form.hours}
                                onChange={e=>setForm(f=>({ ...f, hours:e.target.value }))}
                                placeholder="0-8"
                              />
                              <div className="form-check ms-2">
                                <input className="form-check-input" type="checkbox" id="chkOt" checked={form.overtime} onChange={e=>setForm(f=>({ ...f, overtime:e.target.checked }))}/>
                                <label className="form-check-label" htmlFor="chkOt">Overtime</label>
                              </div>
                            </div>
                            {submitted && errors.hours && <div className="invalid-feedback d-block">{errors.hours}</div>}
                            <div className="form-text">Max 8 hrs (unlimited when Overtime is checked).</div>
                          </div>

                          <div className="col-12 col-md-3">
                            <label className="form-label text-primary">New Tasks</label>
                            <input className={`form-control ${submitted && errors.newTask ? "is-invalid":""}`} value={form.newTask} onChange={e=>setForm(f=>({ ...f, newTask:e.target.value }))}/>
                            {submitted && errors.newTask && <div className="invalid-feedback">{errors.newTask}</div>}
                          </div>
                          <div className="col-12 col-md-3">
                            <label className="form-label text-danger">Reworked</label>
                            <input className={`form-control ${submitted && errors.reworked ? "is-invalid":""}`} value={form.reworked} onChange={e=>setForm(f=>({ ...f, reworked:e.target.value }))}/>
                            {submitted && errors.reworked && <div className="invalid-feedback">{errors.reworked}</div>}
                          </div>
                          <div className="col-12 col-md-3">
                            <label className="form-label text-info">PR Passed</label>
                            <input className={`form-control ${submitted && errors.prPassed ? "is-invalid":""}`} value={form.prPassed} onChange={e=>setForm(f=>({ ...f, prPassed:e.target.value }))}/>
                            {submitted && errors.prPassed && <div className="invalid-feedback">{errors.prPassed}</div>}
                          </div>
                          <div className="col-12 col-md-3">
                            <label className="form-label text-success">Approved</label>
                            <input className={`form-control ${submitted && errors.approved ? "is-invalid":""}`} value={form.approved} onChange={e=>setForm(f=>({ ...f, approved:e.target.value }))}/>
                            {submitted && errors.approved && <div className="invalid-feedback">{errors.approved}</div>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">Save</button>
                      <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowModal(false)}>Close</button>
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
