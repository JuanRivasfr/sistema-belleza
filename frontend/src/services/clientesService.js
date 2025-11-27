import API from "./api";

export const getClientes = async () => {
  const res = await API.get("/clientes");
  return res.data;
};
