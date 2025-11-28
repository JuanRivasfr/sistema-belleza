import { useEffect, useState } from "react";
import { createCita as apiCreateCita, getDisponibilidad } from "../services/citasService";

export default function CrearCita({ initialFecha = "", clientes = [], servicios = [], empleados = [], onSaved = null, onCancel = null }) {
  const [clienteId, setClienteId] = useState("");
  const [especialistaId, setEspecialistaId] = useState("");
  const [selectedServicios, setSelectedServicios] = useState([]);
  const [fecha, setFecha] = useState(initialFecha || new Date().toISOString().slice(0,10));
  const [horaInicio, setHoraInicio] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // si solo hay un cliente/especialista por defecto los puede preseleccionar
    if (clientes.length === 1) setClienteId(clientes[0].id);
    if (empleados.length === 1) setEspecialistaId(empleados[0].id);
  }, [clientes, empleados]);

  const toggleServicio = (id) => {
    setSelectedServicios(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const calcularDuracionTotal = () => {
    return selectedServicios.reduce((sum, sId) => {
      const s = servicios.find(x => x.id === sId);
      return sum + (s ? Number(s.duracion_minutos || 0) : 0);
    }, 0);
  };

  const buscarDisponibilidad = async () => {
    if (!especialistaId || !fecha || selectedServicios.length === 0) {
      alert("Seleccione especialista, fecha y al menos un servicio.");
      return;
    }
    const dur = calcularDuracionTotal();
    setLoading(true);
    try {
      const res = await getDisponibilidad(especialistaId, fecha, dur);
      setSlots(res || []);
      setHoraInicio("");
    } catch (err) {
      console.error(err);
      alert("Error al obtener disponibilidad.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!clienteId || !especialistaId || selectedServicios.length === 0 || !horaInicio) {
      alert("Complete todos los campos y seleccione una hora.");
      return;
    }
    setCreating(true);
    try {
      await apiCreateCita({
        cliente_id: clienteId,
        especialista_id: especialistaId,
        fecha,
        hora_inicio: horaInicio,
        servicios: selectedServicios
      });
      if (onSaved) await onSaved();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "No se pudo crear la cita.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="form-box modal-4cols"
      style={{
        maxWidth: "100%",
        maxHeight: "70vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // centra horizontalmente el contenido dentro del contenedor
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <h3 style={{ marginBottom: 12 }}>Crear Cita</h3>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <div className="form-row">
          <div className="input-group">
            <label>Cliente</label>
            <select value={clienteId} onChange={e => setClienteId(e.target.value)} required>
              <option value="">-- seleccione --</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Especialista</label>
            <select value={especialistaId} onChange={e => setEspecialistaId(e.target.value)} required>
              <option value="">-- seleccione --</option>
              {empleados.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellido}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Servicios (seleccione uno o varios)</label>
          <div className="servicios-grid" style={{ marginTop: 8 }}>
            {servicios.map(s => {
              const active = selectedServicios.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleServicio(s.id)}
                  className={`btn-pastel ${active ? "pastel-ver" : ""}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, color: "#c2185b" }}>{s.nombre}</div>
                    <div style={{ fontSize: 13, color: "#666" }}>{s.descripcion?.slice?.(0,80)}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    <div style={{ fontWeight: 700 }}>{s.duracion_minutos} min</div>
                    <div style={{ fontSize: 13, color: "#444" }}>{s.precio} COP</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-row" style={{ marginTop: 12 }}>
          <div className="input-group">
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button type="button" className="btn" onClick={buscarDisponibilidad} disabled={loading}>
              {loading ? "Buscando..." : "Buscar horarios"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Horarios disponibles</label>
          <div className="slots-container" style={{ marginTop: 8 }}>
            {slots.length === 0 && <small>Pulse "Buscar horarios" para ver opciones</small>}
            {slots.map(s => {
              const active = horaInicio === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setHoraInicio(s)}
                  className={`slot-button ${active ? "active-slot" : ""}`}
                >
                  {s.slice(0,5)}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="submit" className="btn" disabled={creating || !horaInicio}>
            {creating ? "Creando..." : "Crear cita"}
          </button>
        </div>
      </form>
    </div>
  );
}