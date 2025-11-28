import AdminLayout from "../layouts/AdminLayout";
import { useEffect, useState } from "react";
import {
  getCitas as apiGetCitas,
  updateCita as apiUpdateCita,
  cancelCita as apiCancelCita,
  getDisponibilidad as apiGetDisponibilidad,
  updateCitaEstado as apiUpdateCitaEstado,
} from "../services/citasService";
import { getClientes } from "../services/clientesService";
import { getServicios } from "../services/serviciosService";
import { getEmpleados } from "../services/empleadosService";
import CrearCita from "./CrearCita";

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [showForm, setShowForm] = useState(false);

  // precarga (para CrearCita)
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  // editar / reprogramar / cancelar
  const [editingCita, setEditingCita] = useState(null);
  const [editClienteId, setEditClienteId] = useState("");
  const [editEspecialistaId, setEditEspecialistaId] = useState("");
  const [editSelectedServicios, setEditSelectedServicios] = useState([]);
  const [editFecha, setEditFecha] = useState("");
  const [editHora, setEditHora] = useState("");
  const [editSlots, setEditSlots] = useState([]);
  const [loadingEditSlots, setLoadingEditSlots] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [changingEstadoId, setChangingEstadoId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, s, e] = await Promise.all([getClientes(), getServicios(), getEmpleados()]);
        setClientes(c);
        setServicios(s);
        setEmpleados(e);
      } catch (err) {
        console.error(err);
      }
    })();
    load(fecha);
  }, []);

  useEffect(() => {
    load(fecha);
  }, [fecha]);

  const load = async (f = null) => {
    try {
      const data = await apiGetCitas(f || fecha);
      setCitas(data);
    } catch (err) {
      console.error(err);
      setCitas([]);
    }
  };

  // abrir modal de edición con datos de la cita
  const abrirEditar = (cita) => {
    setEditingCita(cita);
    setEditClienteId(cita.cliente_id || "");
    setEditEspecialistaId(cita.especialista_id || "");
    setEditSelectedServicios(Array.isArray(cita.servicios) ? cita.servicios.map(s => s.id) : []);
    // Normalizar a formato yyyy-MM-dd para el input[type=date]
    try {
      const iso = new Date(cita.fecha).toISOString().slice(0, 10);
      setEditFecha(iso);
    } catch (err) {
      setEditFecha(String(cita.fecha).slice(0, 10));
    }
    setEditHora(cita.hora_inicio);
    setEditSlots([]);
  };

  const toggleEditServicio = (id) => {
    setEditSelectedServicios(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const calcularDuracionTotalEdit = () => {
    return editSelectedServicios.reduce((sum, sId) => {
      const s = servicios.find((x) => x.id === sId);
      return sum + (s ? Number(s.duracion_minutos || 0) : 0);
    }, 0);
  };

  const buscarDisponibilidadEdit = async () => {
    if (!editEspecialistaId || !editFecha || editSelectedServicios.length === 0) {
      alert("Seleccione especialista, fecha y al menos un servicio.");
      return;
    }
    const dur = calcularDuracionTotalEdit();
    setLoadingEditSlots(true);
    setEditSlots([]);
    setEditHora("");
    try {
      const res = await apiGetDisponibilidad(editEspecialistaId, editFecha, dur);
      setEditSlots(res || []);
    } catch (err) {
      console.error(err);
      alert("Error al obtener disponibilidad.");
    } finally {
      setLoadingEditSlots(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!editClienteId || !editEspecialistaId || editSelectedServicios.length === 0 || !editHora) {
      alert("Complete todos los campos y seleccione una hora.");
      return;
    }
    setSavingEdit(true);
    try {
      await apiUpdateCita(editingCita.id, {
        cliente_id: editClienteId,
        especialista_id: editEspecialistaId, // <-- ahora se envía
        fecha: editFecha,
        hora_inicio: editHora,
        servicios: editSelectedServicios,
      });
      setEditingCita(null);
      await load(fecha);
      alert("Cita actualizada.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "No se pudo actualizar la cita.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelCita = async (id) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    try {
      await apiCancelCita(id);
      await load(fecha);
      alert("Cita cancelada.");
    } catch (err) {
      console.error(err);
      alert("No se pudo cancelar la cita.");
    }
  };

  const handleChangeEstado = async (id, nuevoEstado) => {
    try {
      setChangingEstadoId(id);
      await apiUpdateCitaEstado(id, nuevoEstado);
      await load(fecha);
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado.');
    } finally {
      setChangingEstadoId(null);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
      <div className="form-box modal-4cols" style={{ width: "100%", maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 className="titulo-clientes">Citas</h2>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input-pink" />
            <button className="btn" onClick={() => setShowForm(s => !s)}>{showForm ? "Cerrar" : "Crear Cita"}</button>
          </div>
        </div>

        {showForm && (
          <div style={{ marginBottom: 18 }}>
            <CrearCita
              initialFecha={fecha}
              clientes={clientes}
              servicios={servicios}
              empleados={empleados}
              onSaved={async () => {
                setShowForm(false);
                await load(fecha);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Modal de editar / reprogramar cita */}
        {editingCita && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.4)", zIndex: 9999 }}>
            <div className="form-box" style={{ width: 900, maxHeight: "85vh", overflowY: "auto" }}>
              <h3 style={{ marginBottom: 12 }}>Editar / Reprogramar cita</h3>

              <form onSubmit={handleSaveEdit}>
                <div className="form-row">
                  <div className="input-group">
                    <label>Cliente</label>
                    <select value={editClienteId} onChange={e => setEditClienteId(e.target.value)} required>
                      <option value="">-- seleccione --</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Especialista</label>
                    <select value={editEspecialistaId} onChange={e => setEditEspecialistaId(e.target.value)} required>
                      <option value="">-- seleccione --</option>
                      {empleados.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellido}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>Servicios (seleccione uno o varios)</label>
                  <div className="servicios-grid" style={{ marginTop: 8 }}>
                    {servicios.map(s => {
                      const active = editSelectedServicios.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleEditServicio(s.id)}
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
                    <input type="date" value={editFecha} onChange={e => setEditFecha(e.target.value)} required />
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                    <button type="button" className="btn" onClick={buscarDisponibilidadEdit} disabled={loadingEditSlots}>
                      {loadingEditSlots ? "Buscando..." : "Buscar horarios"}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label>Horarios disponibles</label>
                  <div className="slots-container" style={{ marginTop: 8 }}>
                    {editSlots.length === 0 && <small>Pulse "Buscar horarios" para ver opciones</small>}
                    {editSlots.map(s => {
                      const active = editHora === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setEditHora(s)}
                          className={`slot-button ${active ? "active-slot" : ""}`}
                        >
                          {s.slice(0,5)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="submit" className="btn" disabled={savingEdit || !editHora}>
                    {savingEdit ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="citas-grid">
          {citas.length === 0 && (
            <div className="card-cliente" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              <p>No hay citas para esta fecha.</p>
            </div>
          )}

          {citas.map((cita) => (
            <div key={cita.id} className="card-cita">
              <p className="cliente-nombre">{cita.nombre_cliente} {cita.apellido_cliente}</p>
              <p className="cliente-dato">{cita.fecha} • {cita.hora_inicio?.slice(0,5)}</p>
              <p className="cliente-dato" style={{ marginTop: 8, fontWeight: 600 }}>
                {cita.nombre_especialista} {cita.apellido_especialista}
              </p>

              <div style={{ marginTop: 10 }}>
                <strong>Servicios:</strong>
                <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                  {Array.isArray(cita.servicios) && cita.servicios.length > 0 ? (
                    cita.servicios.map(s => <li key={s.id}>{s.nombre} — {s.duracion_minutos} min</li>)
                  ) : <li>-</li>}
                </ul>
              </div>

              <div className="botones-row" style={{ marginTop: 12 }}>
                <button className="btn-pastel pastel-ver" onClick={() => abrirEditar(cita)}>Editar / Reprogramar</button>
                <button className="btn-pastel pastel-eliminar" onClick={() => handleCancelCita(cita.id)}>Cancelar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
