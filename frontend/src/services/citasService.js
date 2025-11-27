import API from "./api";

export const getCitas = async () => {
  const res = await API.get("/citas");
  return res.data;
};
