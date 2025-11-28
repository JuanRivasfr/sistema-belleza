import React, { useEffect, useState } from "react";
import { getCitas, updateCitaEstado } from "../services/citasService";
import { registrarPago } from "../services/pagosService";

export default function Dashboard() {
  const [citas, setCitas] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  const [changingEstadoId, setChangingEstadoId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentCita, setPaymentCita] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [paymentReferencia, setPaymentReferencia] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCitas(today);
        setCitas(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const reload = async () => {
    try {
      const data = await getCitas(today);
      setCitas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const statusClass = (estado) => {
    if (estado === "pendiente") return "status-badge pendiente";
    if (estado === "en curso") return "status-badge en-curso";
    if (estado === "finalizada") return "status-badge finalizada";
    return "status-badge";
  };

  const openModal = (cita) => setSelectedCita(cita);
  const closeModal = () => setSelectedCita(null);

  const handleChangeEstado = async (id, nuevoEstado) => {
    // abrir modal de pago cuando se selecciona 'finalizada'
    if (nuevoEstado === "finalizada") {
      const cita = citas.find((c) => c.id === id);
      setPaymentCita(cita);
      setPaymentMethod("efectivo");
      setPaymentReferencia("");
      setPaymentModalOpen(true);
      return;
    }

    try {
      setChangingEstadoId(id);
      await updateCitaEstado(id, nuevoEstado);
      await reload();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado.");
    } finally {
      setChangingEstadoId(null);
    }
  };

  const totalServicios = (cita) => {
    if (!cita || !Array.isArray(cita.servicios)) return 0;
    return cita.servicios.reduce((s, item) => s + (Number(item.precio || item.valor || 0)), 0);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setPaymentCita(null);
    setPaymentReferencia("");
    setPaymentMethod("efectivo");
    setPaymentLoading(false);
  };

  const handleConfirmPayment = async () => {
    if (!paymentCita) return;
    setPaymentLoading(true);
    try {
      const valor = totalServicios(paymentCita);
      // crear pago
      await registrarPago({
        cita_id: paymentCita.id,
        metodo_pago: paymentMethod,
        valor,
        referencia: paymentReferencia || null,
      });

      // marcar cita finalizada
      await updateCitaEstado(paymentCita.id, "finalizada");
      await reload();
      closePaymentModal();
      alert("Pago registrado y cita finalizada.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error registrando pago.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      {/* Tabla principal de citas del día */}
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicios</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Especialista</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {citas.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>No hay citas para hoy.</td>
              </tr>
            )}

            {citas.map((c) => (
              <tr key={c.id} className="dashboard-row">
                <td>
                  <div style={{ fontWeight: 700 }}>{c.nombre_cliente} {c.apellido_cliente}</div>
                  <div className="muted">{c.cliente_telefono || ""}</div>
                </td>

                <td>
                  <div className="muted small">
                    {Array.isArray(c.servicios) ? c.servicios.map(s => s.nombre).join(", ") : "-"}
                  </div>
                </td>

                <td>{c.fecha}</td>
                <td>{c.hora_inicio?.slice(0,5) || "-"}</td>
                <td>{c.nombre_especialista || "-"} {c.apellido_especialista || ""}</td>

                <td>
                  {/* select único con apariencia de badge */}
                  <select
                    className={`${statusClass(c.estado)} status-select badge-select`}
                    value={c.estado}
                    onChange={(e) => handleChangeEstado(c.id, e.target.value)}
                    disabled={changingEstadoId === c.id}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en curso">En curso</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal detalle cita (se mantiene) */}
      {selectedCita && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="form-box" style={{ width: 760, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>{selectedCita.nombre_cliente} — {selectedCita.hora_inicio?.slice(0,5)}</h3>
              <button className="btn" onClick={closeModal}>Cerrar</button>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: 6, fontWeight: 700, color: "#c2185b" }}>{selectedCita.nombre_cliente} {selectedCita.apellido_cliente}</p>
                <p className="cliente-dato">{selectedCita.fecha} • {selectedCita.hora_inicio?.slice(0,5)}</p>
                <p style={{ marginTop: 8 }}><strong>Especialista:</strong> {selectedCita.nombre_especialista} {selectedCita.apellido_especialista}</p>

                <div style={{ marginTop: 12 }}>
                  <strong>Servicios</strong>
                  <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                    {Array.isArray(selectedCita.servicios) && selectedCita.servicios.length > 0 ? (
                      selectedCita.servicios.map(s => (
                        <li key={s.id} style={{ marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                          <span>{s.nombre}</span>
                          <span className="muted">{s.duracion_minutos} min</span>
                        </li>
                      ))
                    ) : <li>-</li>}
                  </ul>
                </div>
              </div>

              <div style={{ minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className={statusClass(selectedCita.estado)} style={{ textAlign: "center" }}>{selectedCita.estado}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn-pastel pastel-editar" style={{ width: "100%" }} onClick={() => {/* abrir edición si se necesita */}}>Editar</button>
                </div>
                <div>
                  <button className="btn-pastel pastel-eliminar" style={{ width: "100%" }} onClick={() => {/* cancelar action si quieres */}}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {paymentModalOpen && paymentCita && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="form-box" style={{ width: 520, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Registrar pago — {paymentCita.nombre_cliente}</h3>
              <button className="btn" onClick={closePaymentModal}>Cerrar</button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <strong>Servicios</strong>
                <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                  {Array.isArray(paymentCita.servicios) && paymentCita.servicios.length > 0 ? (
                    paymentCita.servicios.map(s => (
                      <li key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span>{s.nombre}</span>
                        <span className="muted">{(s.precio ?? s.valor ?? 0).toLocaleString()}</span>
                      </li>
                    ))
                  ) : <li>-</li>}
                </ul>
              </div>

              <div>
                <strong>Total:</strong>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#c2185b", marginTop: 6 }}>
                  {totalServicios(paymentCita).toLocaleString()} COP
                </div>
              </div>

              <div>
                <label><strong>Método de pago</strong></label>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="radio" name="metodo" value="efectivo" checked={paymentMethod === "efectivo"} onChange={() => setPaymentMethod("efectivo")} />
                    Efectivo
                  </label>
                  <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="radio" name="metodo" value="transferencia" checked={paymentMethod === "transferencia"} onChange={() => setPaymentMethod("transferencia")} />
                    Transferencia
                  </label>
                  <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="radio" name="metodo" value="nequi" checked={paymentMethod === "nequi"} onChange={() => setPaymentMethod("nequi")} />
                    Nequi
                  </label>
                </div>
              </div>

              {(paymentMethod === "transferencia" || paymentMethod === "nequi") && (
                <div>
                  <label>Referencia</label>
                  <input className="input-pink" value={paymentReferencia} onChange={(e) => setPaymentReferencia(e.target.value)} placeholder="Número o referencia" />
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                <button className="btn" onClick={closePaymentModal} disabled={paymentLoading}>Cancelar</button>
                <button className="btn" onClick={handleConfirmPayment} disabled={paymentLoading}>
                  {paymentLoading ? "Procesando..." : "Confirmar y finalizar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
