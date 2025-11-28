import { useState } from "react";
import { updateServicio } from "../services/serviciosService";
import Input from "./Input";
import Button from "./Button";

export default function EditServicioModal({ servicio, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: servicio.nombre || "",
    descripcion: servicio.descripcion || "",
    precio: servicio.precio || "",
    categoria: servicio.categoria || "",
    duracion_minutos: servicio.duracion_minutos || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateServicio(servicio.id, form);
      onSaved();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el servicio.");
    }
    setLoading(false);
  };

  return (
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
      <div style={{ width: 600, maxWidth: "100%", background: "#fff", padding: 20, borderRadius: 8 }}>
        <h3 style={{ marginBottom: 12, color: "#c2185b" }}>Editar Servicio</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Input label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} />
          <Input label="Precio" name="precio" value={form.precio} onChange={handleChange} />
          <Input label="Categoría" name="categoria" value={form.categoria} onChange={handleChange} />
          <Input label="Duración (min)" name="duracion_minutos" value={form.duracion_minutos} onChange={handleChange} />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
            <Button type="button" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}