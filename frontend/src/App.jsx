// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Registro from "./pages/Registro";

// Admin
import Dashboard from "./pages/Dashboard";
import Citas from "./pages/Citas";
import Clientes from "./pages/Clientes";
import Servicios from "./pages/Servicios";
import Pagos from "./pages/Pagos";
import Reportes from "./pages/Reportes";
import AdminLayout from "./layouts/AdminLayout";

// Usuario
import MisCitas from "./pages/MisCitas";
import UserLayout from "./layouts/UserLayout";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas admin */}
          <Route
            element={
              <PrivateRoute rolPermitido="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/reportes" element={<Reportes />} />
          </Route>

          {/* Rutas usuario normal */}
          <Route
            element={
              <PrivateRoute rolPermitido="usuario">
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route path="/mis-citas" element={<MisCitas />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
