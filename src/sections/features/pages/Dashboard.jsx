import React from "react";
import AppLayout from "../components/AppLayout";
import "../dashboard-global.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";


export default function Dashboard() {
  return (
    <AppLayout>
      <div className="pm-dashboard container-fluid px-0">

        {/* === OVERVIEW CARD === */}
        <div className="card shadow-sm mb-2">
          <div className="card-header">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <h6 className="mb-2 mb-md-0">Overview</h6>

              {/* chips + filters aligned right like the image */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2" style={{width: "95%"}}>
                <div className="btn-group pm-chip-group" role="group" aria-label="range">
                  <button className="btn btn-sm active">Today</button>
                  <button className="btn btn-sm">Week</button>
                  <button className="btn btn-sm">Month</button>
                </div>

                <div className="d-flex flex-wrap" style={{gap: 8}}>
                  <select className="form-select form-select-sm pm-compact-select">
                    <option>All Managers</option>
                  </select>
                  <select className="form-select form-select-sm pm-compact-select">
                    <option>All Leads</option>
                  </select>
                  <select className="form-select form-select-sm pm-compact-select">
                    <option>All Pod Leads</option>
                  </select>
                  <input type="date" className="form-control form-control-sm pm-compact-input" placeholder="From Date" />
                  <input type="date" className="form-control form-control-sm pm-compact-input" placeholder="To Date" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            <OverviewTable />
            <div className="px-3 pb-2 small" style={{color:"#6b7280"}}>
              Scope affects counts: Today shows unique trainers and total hours worked today; Week/Month aggregate per the selected period.
            </div>
          </div>
        </div>

        {/* === CHARTS ROW === */}
        <div className="row g-2">
          <div className="col-12 col-lg-5">
            <div className="card h-100">
              <div className="card-header"><h6>Resource Availability</h6></div>
              <div className="card-body"><ResourceAvailabilityChart /></div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card h-100">
              <div className="card-header"><h6># of Tasks by Status</h6></div>
              <div className="card-body"><TasksStatusChart /></div>
            </div>
          </div>

          <div className="col-12 col-lg-3">
            <div className="card h-100">
              <div className="card-header"><h6>Daily Hours</h6></div>
              <div className="card-body"><DailyHoursChart /></div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ========= Inner components (all in this file) ========= */

function OverviewTable() {
  const rows = [
    { project:"Billing Migration", manager:"N. Gupta",  lead:"P. Mehta", pod:"M. Iyer", trainers:1, hours:5,   start:"2025-05-12" },
    { project:"Data Lake ETL",    manager:"L. Kulkarni",lead:"A. Verma", pod:"Z. Khan", trainers:0, hours:0,   start:"2025-04-28" },
    { project:"Fraud Engine",     manager:"L. Kulkarni",lead:"A. Verma", pod:"Z. Khan", trainers:0, hours:0,   start:"2025-06-15" },
    { project:"Inventory Revamp", manager:"N. Gupta",   lead:"S. Rao",   pod:"M. Iyer", trainers:2, hours:10.5,start:"2025-06-02" },
    { project:"Mobile App v3",    manager:"L. Kulkarni",lead:"A. Verma", pod:"Z. Khan", trainers:0, hours:0,   start:"2025-07-01" },
    { project:"Partner Portal",   manager:"N. Gupta",   lead:"S. Rao",   pod:"M. Iyer", trainers:0, hours:0,   start:"2025-08-05" },
  ];

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Manager</th>
            <th>Lead</th>
            <th>Pod Lead</th>
            <th>Trainer (Count)</th>
            <th>Duration (Hours)</th>
            <th>Start Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx)=>(
            <tr key={idx}>
              <td>{r.project}</td>
              <td>{r.manager}</td>
              <td><u>{r.lead}</u></td>
              <td><u>{r.pod}</u></td>
              <td>{r.trainers}</td>
              <td>{r.hours}</td>
              <td>{r.start}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourceAvailabilityChart() {
  const data = [
    { name: "Active", value: 50, color: "#3b81d6" },
    { name: "Idle",   value: 50, color: "#ff6d8c" },
  ];
  return (
    <>
      <div style={{width:"100%", height:260}}>
        <ResponsiveContainer>
          <PieChart margin={{ top: 10, right: 10, left:10, bottom: 0 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={85}
              outerRadius={120}
              startAngle={90}
              endAngle={-270}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">
        {data.map((d) => (
          <span key={d.name}><span className="dot" style={{background:d.color}}></span>{d.name}</span>
        ))}
      </div>
    </>
  );
}


function TasksStatusChart() {
  const data = [
    { status: "Completed", count: 19 },
    { status: "Reworked",  count: 3  },
    { status: "Passed",    count: 18 },
    { status: "Submitted", count: 15 },
  ];
  return (
    <div style={{width:"100%", height:260}}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="status" tick={{ fill:"#6b7280" }} />
          <YAxis tick={{ fill:"#6b7280" }} />
          <Bar dataKey="count" fill="#b7d3f9" stroke="#b7d3f9" maxBarSize={45} radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


function DailyHoursChart() {
  const data = [
    { day: "Mon", hrs: 6.5 },
    { day: "Tue", hrs: 7.0 },
    { day: "Wed", hrs: 7.8 },
    { day: "Thu", hrs: 6.9 },
    { day: "Fri", hrs: 8.0 },
  ];
  return (
    <div style={{width:"100%", height:260}}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fill:"#6b7280" }} />
          <YAxis tick={{ fill:"#6b7280" }} domain={[0, 8]} />
          <Line type="monotone" dataKey="hrs" stroke="#3b81d6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
