import API from "./api";

export const getEmpleados = async () => {
  const res = await API.get("/empleados");
  return res.data;
};