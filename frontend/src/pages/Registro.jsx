import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { registrarUsuario } from "../services/authService";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarSubmit = async (e) => {
    e.preventDefault();

    try {
      await registrarUsuario({ nombre_completo: nombre, correo: email, password });
      setMensaje("Usuario creado correctamente. Ahora puedes iniciar sesión.");
    } catch (err) {
      setMensaje("Error al crear usuario.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#c2185b" }}>
          Crear cuenta
        </h2>

        {mensaje && (
          <p style={{ textAlign: "center", color: "green", marginBottom: 10 }}>
            {mensaje}
          </p>
        )}

        <form onSubmit={manejarSubmit}>
          <Input
            label="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" full>
            Registrarme
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <a href="/" style={{ color: "#c2185b" }}>Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  );
}
