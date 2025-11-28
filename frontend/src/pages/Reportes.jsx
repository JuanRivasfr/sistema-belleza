import { useState } from "react";
import { getCitas } from "../services/citasService";

export default function Reportes() {
  const [fecha, setFecha] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const generarReporteDiario = async () => {
    setLoading(true);
    const datos = await getCitas(fecha);

    const camposExcluidos = [
      "id",
      "cliente_id",
      "especialista_id",
      "created_at",
      "updated_at",
      "cliente_telefono",
    ];

    const filtrados = datos.map((item) => {
      const limpio = {};
      Object.keys(item).forEach((key) => {
        if (!camposExcluidos.includes(key)) {
          limpio[key] = item[key];
        }
      });
      return limpio;
    });

    setResultados(filtrados);
    setLoading(false);
  };

  return (
    <>
      <div className="reportes-wrapper">
        <div className="reportes-filter-container">
          <div className="dashboard-filter-box">
            <label className="dashboard-label">Selecciona una fecha:</label>

            {/* FILA DE FILTROS — AHORA EN COLUMNA */}
            <div className="dashboard-filter-row vertical">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="dashboard-input"
              />

              <button onClick={generarReporteDiario} className="dashboard-btn w-full">
                Generar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {loading && <p className="text-gray-500">Cargando reporte...</p>}

          {!loading && resultados.length === 0 && (
            <p className="text-gray-500">Sin datos.</p>
          )}

          {!loading && resultados.length > 0 && (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    {Object.keys(resultados[0]).map((col) => (
                      <th key={col}>{col.replace("_", " ").toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {resultados.map((fila, index) => (
                    <tr key={index} className="dashboard-row">
                      {Object.values(fila).map((valor, i) => (
                        <td key={i}>
                          {Array.isArray(valor)
                            ? valor.map((v) => v.nombre).join(", ") || "—"
                            : valor === null || valor === ""
                            ? "—"
                            : valor}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
