import * as clientesModel from '../models/clientes.model.js';

export async function createCliente(req, res) {
  const cliente = req.body;
  const created = await clientesModel.createCliente(cliente);
  res.status(201).json(created);
}

export async function updateCliente(req, res) {
  const id = req.params.id;
  const cliente = req.body;
  const updated = await clientesModel.updateCliente(id, cliente);
  res.json(updated);
}

export async function getCliente(req, res) {
  const id = req.params.id;
  const c = await clientesModel.getClienteById(id);
  if (!c) return res.status(404).json({ message: 'Cliente no encontrado' });
  res.json(c);
}

export async function searchClientes(req, res) {
  const q = req.query.q || '';
  const results = await clientesModel.searchClientes(q);
  res.json(results);
}

// nuevo controlador para eliminar cliente
export async function deleteCliente(req, res) {
  const id = req.params.id;
  const deleted = await clientesModel.deleteCliente(id);
  if (!deleted) return res.status(404).json({ message: 'Cliente no encontrado' });
  res.json({ message: 'Cliente eliminado', cliente: deleted });
}
