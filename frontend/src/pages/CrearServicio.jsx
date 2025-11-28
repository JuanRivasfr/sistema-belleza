import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createServicio } from "../services/serviciosService";
import Input from "../components/Input";
import Button from "../components/Button";

export default function CrearServicio() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    duracion_minutos: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createServicio(form);
      navigate("/servicios");
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el servicio.");
    }
    setLoading(false);
  };

  return (
    <div className="form-box" style={{ maxWidth: 450 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20, color: "#c2185b" }}>Crear Servicio</h2>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
        <Input label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} />
        <Input label="Precio" name="precio" value={form.precio} onChange={handleChange} />
        <Input label="Categoría" name="categoria" value={form.categoria} onChange={handleChange} />
        <Input label="Duración (min)" name="duracion_minutos" value={form.duracion_minutos} onChange={handleChange} />

        <Button type="submit" full disabled={loading}>{loading ? "Guardando..." : "Guardar Servicio"}</Button>
      </form>
    </div>
  );
}