import API from "./api";

export const getServicios = async () => {
  const res = await API.get("/servicios");
  return res.data;
};

export const getServicioById = async (id) => {
  const res = await API.get(`/servicios/${id}`);
  return res.data;
};

export const createServicio = async (servicio) => {
  const res = await API.post("/servicios", servicio);
  return res.data;
};

export const updateServicio = async (id, data) => {
  const res = await API.put(`/servicios/${id}`, data);
  return res.data;
};

export const deleteServicio = async (id) => {
  const res = await API.delete(`/servicios/${id}`);
  return res.data;
};

export const searchServicios = async (q) => {
  const res = await API.get(`/servicios?q=${encodeURIComponent(q)}`);
  return res.data;
};
