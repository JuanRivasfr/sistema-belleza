import API from "./api";

export const registrarUsuario = async (datos) => {
  const res = await API.post("/auth/register", datos);
  return res.data;
};
