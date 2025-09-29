import http from "./client";

export const getRoles = async () => {
  const res = await http.get("/roles");
  console.log(res);
  
  const data = res?.data;
  const ok = res.status === 200 && Array.isArray(data?.roles);
  return {
    ok,
    message: data?.message || (ok ? "Roles fetched successfully" : "Failed to fetch roles"),
    data: data,
  };
};

export const getEmployees = async () => {
  const res = await http.get("/employees");
  console.log(res);

  const data = res?.data;
  const ok = res.status === 200 && Array.isArray(data?.employees);
  return {
    ok,
    message: data?.message || (ok ? "Employees fetched successfully" : "Failed to fetch employees"),
    data: data,
  };
};

export const getEmployeeNames = async () => {
  const res = await http.get("/employees_names");
  console.log(res);

  const data = res?.data;
  const ok = res.status === 200 && Array.isArray(data?.names);
  return {
    ok,
    message: data?.message || (ok ? "Employee names fetched successfully" : "Failed to fetch employee names"),
    data: data,
  };
};

export const addEmployee = async (employee) => {
  const res = await http.post("/employees", employee);
  console.log(res);

  const data = res?.data;
  const ok = res.status === 200 && data?.message === "Employee added successfully";
  return {
    ok,
    message: data?.message || (ok ? "Employee added successfully" : "Failed to add employee"),
    data: data,
  };
};

export const updateEmployee = async (id, employee) => {
  const res = await http.put(`/employees/${id}`, employee);
  console.log(res);
    const data = res?.data;
    const ok = res.status === 200 && data?.message === "Employee updated successfully";
    return {
      ok,
      message: data?.message || (ok ? "Employee updated successfully" : "Failed to update employee"),
      data: data,
    };
};

export const deleteEmployee = async (id) => {
  const res = await http.delete(`/employees/${id}`);
  console.log(res);
    const data = res?.data;
    const ok = res.status === 200 && data?.message === "Employee deleted successfully";
    return {
      ok,
      message: data?.message || (ok ? "Employee deleted successfully" : "Failed to delete employee"),
      data: data,
    };
};

export const getProjects = async () => {
  const res = await http.get("/projects");
  console.log(res);
  const data = res?.data;
  const ok = res.status === 200 && Array.isArray(data?.projects);
  return {
    ok,
    message: data?.message || (ok ? "Projects fetched successfully" : "Failed to fetch projects"),
    data: data,
  };
};

export const addProject = async (project) => {
  const res = await http.post("/projects", project);
  console.log(res);
  const data = res?.data;
  const ok = res.status === 200 && data?.message === "Project added successfully";
  return {
    ok,
    message: data?.message || (ok ? "Project added successfully" : "Failed to add project"),
    data: data,
  };
};

export const updateProject = async (id, project) => {
  const res = await http.put(`/projects/${id}`, project);
  console.log(res);
  const data = res?.data;
  const ok = res.status === 200 && data?.message === "Project updated successfully";
  return {
    ok,
    message: data?.message || (ok ? "Project updated successfully" : "Failed to update project"),
    data: data,
  };
};

export const deleteProject = async (id) => {
  const res = await http.delete(`/projects/${id}`);
  console.log(res);
  const data = res?.data;
  const ok = res.status === 200 && data?.message === "Project deleted successfully";
  return {
    ok,
    message: data?.message || (ok ? "Project deleted successfully" : "Failed to delete project"),
    data: data,
  };
};
