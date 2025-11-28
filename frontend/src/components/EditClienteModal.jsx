import { useState } from "react";
import { updateCliente } from "../services/clientesService";

export default function EditClienteModal({ cliente, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: cliente.nombre || "",
    apellido: cliente.apellido || "",
    telefono: cliente.telefono || "",
    correo: cliente.correo || "",
    alias: cliente.alias || "",
    cedula: cliente.cedula || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateCliente(cliente.id, form);
      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el cliente.");
    }
    setLoading(false);
  };

  return (
    /* ahora absolute: se posicionará respecto al contenedor .form-box */
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(0,0,0,0.45)",
      zIndex: 9999,
      padding: 20
    }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)"
      }}>
        <h3 style={{ marginBottom: 10, color: "#c2185b" }}>Editar Cliente</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Correo</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Alias</label>
            <input name="alias" value={form.alias} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Cédula</label>
            <input name="cedula" value={form.cedula} onChange={handleChange} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button type="button" className="btn" onClick={onClose} disabled={loading} style={{ background: "#999" }}>
              Cancelar
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}