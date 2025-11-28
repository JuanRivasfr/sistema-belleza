import { useEffect, useState } from "react";
import { getClientes, deleteCliente, searchClientes, getClienteById } from "../services/clientesService";
import { useNavigate } from "react-router-dom";
import EditClienteModal from "../components/EditClienteModal"; // <-- nuevo componente

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editingCliente, setEditingCliente] = useState(null); // cliente que se edita (obj) o null
  const navigate = useNavigate();

  const loadClientes = async () => {
    try {
      const data = await searchClientes(busqueda);
      setClientes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      loadClientes();
    }, 300); // debounce 300ms
    return () => clearTimeout(t);
  }, [busqueda]);

  // carga inicial (por si falla la primera búsqueda)
  useEffect(() => {
    const init = async () => {
      try {
        const data = await getClientes();
        setClientes(data);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const eliminarCliente = async (id) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      await deleteCliente(id);
      await loadClientes();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el cliente.");
    }
  };

  // abrir modal: cargar cliente por id para tener datos completos
  const abrirEditar = async (id) => {
    try {
      const c = await getClienteById(id);
      setEditingCliente(c);
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar el cliente para editar.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>

      {/* hacer relativo para que el modal absolute se limite a este contenedor */}
      <div className="form-box modal-4cols" style={{ maxWidth: 1100, width: "100%", position: "relative" }}>

        <h2
          style={{
            textAlign: "center",
            marginBottom: 20,
            color: "#c2185b",
            fontWeight: "bold",
          }}
        >
          Clientes
        </h2>

        <button
          className="btn-pastel btn-crear"
          onClick={() => navigate("/clientes/nuevo")}
        >
          Crear Cliente
        </button>

        <input
          type="text"
          placeholder="Buscar cliente..."
          className="input-pink"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="clientes-grid">
          {clientes.map((c) => (
            <div key={c.id} className="card-cliente">

              <p className="cliente-nombre">{c.nombre}</p>
              <p className="cliente-dato">{c.telefono}</p>
              <p className="cliente-dato">{c.correo}</p>

              <div className="botones-row">
                {/* Se quita "Ver" y "Editar" abre modal */}
                <button className="btn-pastel pastel-editar" onClick={() => abrirEditar(c.id)}>Editar</button>
                <button className="btn-pastel pastel-eliminar" onClick={() => eliminarCliente(c.id)}>Eliminar</button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Modal de edición */}
      {editingCliente && (
        <EditClienteModal
          cliente={editingCliente}
          onClose={() => setEditingCliente(null)}
          onSaved={async () => {
            setEditingCliente(null);
            await loadClientes();
          }}
        />
      )}

    </div>
  );

}
