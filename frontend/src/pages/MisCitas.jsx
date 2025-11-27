// src/pages/MisCitas.jsx
import { useState } from "react";

export default function MisCitas() {
  // Datos quemados de ejemplo
  const [citas] = useState([
    { id: 1, fecha: "2025-12-01", hora: "10:00 AM", servicio: "Corte de cabello", estado: "Confirmada" },
    { id: 2, fecha: "2025-12-02", hora: "02:00 PM", servicio: "Manicure", estado: "Pendiente" },
    { id: 3, fecha: "2025-12-03", hora: "11:00 AM", servicio: "Masaje", estado: "Cancelada" },
  ]);

  return (
    <div className="mis-citas-container">
      <h2 className="text-2xl font-semibold mb-4">Mis Citas</h2>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Fecha</th>
            <th className="border px-4 py-2">Hora</th>
            <th className="border px-4 py-2">Servicio</th>
            <th className="border px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {citas.map((cita) => (
            <tr key={cita.id} className="text-center">
              <td className="border px-4 py-2">{cita.fecha}</td>
              <td className="border px-4 py-2">{cita.hora}</td>
              <td className="border px-4 py-2">{cita.servicio}</td>
              <td className="border px-4 py-2">{cita.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
