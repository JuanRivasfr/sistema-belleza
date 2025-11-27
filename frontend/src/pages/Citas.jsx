import AdminLayout from "../layouts/AdminLayout";
import { useEffect, useState } from "react";
import { getCitas } from "../services/citasService";

export default function Citas() {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getCitas();
    setCitas(data);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Citas</h2>

      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-2">Cliente</th>
            <th className="p-2">Servicio</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>

        <tbody>
          {citas.map((cita) => (
            <tr key={cita.id} className="border-t">
              <td className="p-2">{cita.nombre_cliente}</td>
              <td className="p-2">{cita.nombre_servicio}</td>
              <td className="p-2">{cita.fecha}</td>
              <td className="p-2">{cita.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
