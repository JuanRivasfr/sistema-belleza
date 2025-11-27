// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute({ children, rolPermitido }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <div>Cargando...</div>; // espera a cargar el contexto

  if (!usuario) return <Navigate to="/" replace />; // si no está logeado, va al login

  if (rolPermitido && usuario.rol !== rolPermitido) {
    // si tiene rol y no coincide, también vuelve al login (o a otra ruta)
    return <Navigate to="/" replace />;
  }

  return children;
}
