import API from "./api"; // tu axios con baseURL

export async function getClientes() {
  const res = await API.get("/clientes");
  return res.data;
}

export const getClienteById = async (id) => {
  const res = await API.get(`/clientes/${id}`);
  return res.data;
};

export async function createCliente(cliente) {
  const res = await API.post("/clientes", cliente);
  return res.data;
}

export const updateCliente = async (id, data) => {
  const res = await API.put(`/clientes/${id}`, data);
  return res.data;
};

export const deleteCliente = async (id) => {
  const res = await API.delete(`/clientes/${id}`);
  return res.data;
};

export const searchClientes = async (q) => {
  const res = await API.get(`/clientes?q=${q}`);
  return res.data;
};
