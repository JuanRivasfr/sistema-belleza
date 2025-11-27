import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { usuario, logout } = useAuth();

  return (
    <nav className="navbar">
      <span className="navbar-title">Sistema Belleza</span>

      <div>
        <span style={{ marginRight: "10px" }}>{usuario?.nombre}</span>
        <button className="btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
