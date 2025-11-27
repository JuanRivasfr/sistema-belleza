// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioData = localStorage.getItem("usuario");

    if (token && usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }

    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { correo: email, password });

    // soportar varios nombres posibles
    const user = res.data.user || res.data.usuario || res.data.usuario?.usuario || res.data;
    const token = res.data.token || res.data.accessToken || res.data.access_token;

    if (!token || !user) {
      throw new Error("Respuesta de login inválida: " + JSON.stringify(res.data));
    }

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(user));

    setUsuario(user);
    console.log(usuario)
    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};
