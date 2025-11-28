import API from "./api";

export const registrarPago = async ({ cita_id, metodo_pago, valor, referencia = null }) => {
  const res = await API.post("/pagos", { cita_id, metodo_pago, valor, referencia });
  return res.data;
};