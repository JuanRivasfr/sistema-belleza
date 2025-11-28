import API from "./api";

export const getCitas = async (fecha = null) => {
  const params = fecha ? { fecha } : {};
  const res = await API.get("/citas", { params });
  return res.data;
};

export const createCita = async (payload) => {
  const res = await API.post("/citas", payload);
  return res.data;
};

// solicita slots disponibles: GET /api/citas/especialista/:id/available?fecha=YYYY-MM-DD&duracion=NN
export const getDisponibilidad = async (especialistaId, fecha, duracionMinutos) => {
  const res = await API.get(`/citas/especialista/${especialistaId}/available`, {
    params: { fecha, duracion: duracionMinutos },
  });
  return res.data;
};

// ----------------- nuevas funciones -----------------
export const updateCita = async (id, payload) => {
  const res = await API.put(`/citas/${id}`, payload);
  return res.data;
};

export const cancelCita = async (id) => {
  const res = await API.post(`/citas/${id}/cancel`);
  return res.data;
};

// ====================== nuevo ======================
// actualizar estado
export const updateCitaEstado = async (id, estado) => {
  const res = await API.patch(`/citas/${id}/status`, { estado });
  return res.data;
};

export const deleteCita = async (id) => {
  const res = await API.delete(`/citas/${id}`);
  return res.data;
};
