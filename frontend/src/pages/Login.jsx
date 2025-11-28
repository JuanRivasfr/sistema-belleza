// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const manejarSubmit = async (e) => {
  e.preventDefault();
  try {
    const usuario = await login(email, password);
    if (usuario.rol === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/mis-citas");
    }
  } catch(err) {
    setError("Credenciales incorrectas");
    console.log(err)
  }
};

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#c2185b" }}>
          Sistema de Belleza
        </h2>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <form onSubmit={manejarSubmit}>
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
            Iniciar Sesión
          </Button>
        </form>

        {/* ENLACE PARA CREAR USUARIO
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <Link to="/registro" style={{ color: "#c2185b", textDecoration: "none" }}>
            Crear una nueva cuenta
          </Link>
        </div> */}
      </div>
    </div>
  );
}
