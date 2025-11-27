import * as serviciosModel from '../models/servicios.model.js';

export async function listServicios(req, res) {
  const rows = await serviciosModel.listServicios();
  res.json(rows);
}

export async function createServicio(req, res) {
  const data = req.body;
  const created = await serviciosModel.createServicio(data);
  res.status(201).json(created);
}

export async function updateServicio(req, res) {
  const id = req.params.id;
  const updated = await serviciosModel.updateServicio(id, req.body);
  res.json(updated);
}

export async function deleteServicio(req, res) {
  const id = req.params.id;
  await serviciosModel.deleteServicio(id);
  res.json({ message: 'Servicio eliminado' });
}
