import { useEffect, useState } from "react";
import {
  getServicios,
  deleteServicio,
  searchServicios,
  getServicioById,
} from "../services/serviciosService";
import { useNavigate } from "react-router-dom";
import EditServicioModal from "../components/EditServicioModal";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editingServicio, setEditingServicio] = useState(null);
  const navigate = useNavigate();

  const loadServicios = async () => {
    try {
      const data = await searchServicios(busqueda);
      setServicios(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      loadServicios();
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getServicios();
        setServicios(data);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await deleteServicio(id);
      await loadServicios();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el servicio.");
    }
  };

  const abrirEditar = async (id) => {
    try {
      const s = await getServicioById(id);
      setEditingServicio(s);
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar el servicio para editar.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>

      {/* contenedor relativo: modal absolute/overlay se limitará aquí */}
      <div className="form-box modal-4cols" style={{ maxWidth: 1100, width: "100%", position: "relative" }}>

        <h2
          style={{
            textAlign: "center",
            marginBottom: 20,
            color: "#c2185b",
            fontWeight: "bold",
          }}
        >
          Servicios
        </h2>

        <button
          className="btn-pastel btn-crear"
          onClick={() => navigate("/servicios/nuevo")}
        >
          Crear Servicio
        </button>

        <input
          type="text"
          placeholder="Buscar servicio..."
          className="input-pink"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="clientes-grid">
          {servicios.map((s) => (
            <div key={s.id} className="card-cliente">

              <p className="cliente-nombre">{s.nombre}</p>
              <p className="cliente-dato">{s.descripcion}</p>
              <p className="cliente-dato">{s.precio} COP</p>

              <div className="botones-row">
                <button className="btn-pastel pastel-editar" onClick={() => abrirEditar(s.id)}>Editar</button>
                <button className="btn-pastel pastel-eliminar" onClick={() => eliminar(s.id)}>Eliminar</button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {editingServicio && (
        <EditServicioModal
          servicio={editingServicio}
          onClose={() => setEditingServicio(null)}
          onSaved={async () => {
            setEditingServicio(null);
            await loadServicios();
          }}
        />
      )}

    </div>
  );
}