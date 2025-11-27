import AdminLayout from "../layouts/AdminLayout";
import { useEffect, useState } from "react";
import { getServicios } from "../services/serviciosService";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getServicios();
    setServicios(data);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Servicios</h2>

      <div className="grid grid-cols-3 gap-4">
        {servicios.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded shadow">
            <p className="font-bold">{s.nombre}</p>
            <p>{s.precio} COP</p>
          </div>
        ))}
      </div>
    </>
  );
}
