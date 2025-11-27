import AdminLayout from "../layouts/AdminLayout";
import { useEffect, useState } from "react";
import { getClientes } from "../services/clientesService";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Clientes</h2>

      <div className="grid gap-4">
        {clientes.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{c.nombre}</p>
            <p className="text-gray-600">{c.telefono}</p>
            <p className="text-gray-600">{c.email}</p>
          </div>
        ))}
      </div>
    </>
  );
}
