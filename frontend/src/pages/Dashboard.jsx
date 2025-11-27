import React from 'react';
export default function Dashboard() {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">Total Citas: 12</div>
        <div className="bg-white p-4 rounded shadow">Clientes: 8</div>
        <div className="bg-white p-4 rounded shadow">Ingresos: $450.000</div>
      </div>
    </>
  );
}
