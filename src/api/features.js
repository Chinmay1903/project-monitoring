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

export const getManagerNames = async () => {
  const res = await http.get("/manager_names");
  console.log(res);

  const data = res?.data;
  const ok = res.status === 200 && Array.isArray(data?.names);
  return {
    ok,
    message: data?.message || (ok ? "Manager names fetched successfully" : "Failed to fetch manager names"),
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
