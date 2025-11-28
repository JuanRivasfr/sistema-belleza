import { useEffect, useState } from "react";
import API from "../services/api"; // o tu pagosService

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPagos = async () => {
    try {
      const res = await API.get("/pagos");
      setPagos(res.data);
    } catch (err) {
      console.error(err);
      setError("Error cargando los pagos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPagos();
  }, []);

  const formatCurrency = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(valor);

  return (
    <>
      {loading && <p className="pagos-loading">Cargando pagos...</p>}
      {error && <p className="pagos-error">{error}</p>}

      {!loading && pagos.length === 0 && (
        <p className="pagos-empty">No hay pagos registrados.</p>
      )}

      {pagos.length > 0 && (
        <div className="pagos-table-wrap">
          <table className="pagos-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Especialista</th>
                <th>Método</th>
                <th>Valor</th>
                <th>Referencia</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id} className="pagos-row">
                  <td>
                    <div className="pagos-bold">
                      {pago.cliente_nombre && pago.cliente_apellido
                        ? `${pago.cliente_nombre} ${pago.cliente_apellido}`
                        : "Desconocido"}
                    </div>
                  </td>
                  <td>
                    <div className="pagos-bold">
                      {pago.especialista_nombre && pago.especialista_apellido
                        ? `${pago.especialista_nombre} ${pago.especialista_apellido}`
                        : "Desconocido"}
                    </div>
                  </td>
                  <td>{pago.metodo_pago}</td>
                  <td className="pagos-valor">{formatCurrency(pago.valor)}</td>
                  <td>{pago.referencia || "-"}</td>
                  <td>{new Date(pago.fecha).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
