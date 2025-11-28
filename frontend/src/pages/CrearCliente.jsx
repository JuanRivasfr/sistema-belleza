import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCliente } from "../services/clientesService";
import Input from "../components/Input";
import Button from "../components/Button";

export default function CrearCliente() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    alias: "",
    cedula: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createCliente(form);
      navigate("/clientes");
    } catch (err) {
      console.log(err);
      setError("No se pudo crear el cliente.");
    }

    setLoading(false);
  };

  return (
      <div className="form-box" style={{ maxWidth: 450 }}>

        <h2 style={{
          textAlign: "center",
          marginBottom: 20,
          color: "#c2185b"
        }}>
          Crear Cliente
        </h2>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <Input
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />

          <Input
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />

          <Input
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />

          <Input
            label="Correo"
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
          />

          <Input
            label="Alias"
            name="alias"
            value={form.alias}
            onChange={handleChange}
          />

          <Input
            label="Cédula"
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
          />

          <Button type="submit" full disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cliente"}
          </Button>

        </form>
      </div>
  );
}
