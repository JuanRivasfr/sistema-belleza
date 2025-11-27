import API from "./api";

export const getServicios = async () => {
  const res = await API.get("/servicios");
  return res.data;
};
