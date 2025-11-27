import * as citasModel from '../models/citas.model.js';
import * as serviciosModel from '../models/servicios.model.js';
import db from '../config/db.js';

/**
 * Crear cita (solo ADMIN)
 */
export async function crearCita(req, res) {
  try {
    const { cliente_id, especialista_id, fecha, hora_inicio, servicios } = req.body;

    if (!cliente_id || !especialista_id || !fecha || !hora_inicio || !Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    // calcular duración
    const placeholders = servicios.map((_, i) => `$${i + 1}`).join(',');
    const servicioRows = await db.query(
      `SELECT id, duracion_minutos FROM servicios WHERE id IN (${placeholders})`,
      servicios
    );

    if (servicioRows.rows.length !== servicios.length) {
      return res.status(400).json({ message: 'Uno o más servicios inválidos' });
    }

    const totalMin = servicioRows.rows.reduce((s, r) => s + Number(r.duracion_minutos), 0);

    // calcular hora_fin
    const [hh, mm] = hora_inicio.split(':').map(Number);
    const inicioDate = new Date(`${fecha}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`);
    const finDate = new Date(inicioDate.getTime() + totalMin * 60000);

    const hora_fin = `${String(finDate.getHours()).padStart(2, '0')}:${String(finDate.getMinutes()).padStart(2, '0')}:00`;
    const hora_inicio_sql = `${String(inicioDate.getHours()).padStart(2, '0')}:${String(inicioDate.getMinutes()).padStart(2, '0')}:00`;

    // validar solapamiento
    const overlap = await citasModel.hasOverlap(especialista_id, fecha, hora_inicio_sql, hora_fin);
    if (overlap) return res.status(409).json({ message: 'El especialista tiene otra cita en ese horario' });

    // crear cita
    const cita = await citasModel.createCita({
      cliente_id,
      especialista_id,
      fecha,
      hora_inicio: hora_inicio_sql,
      hora_fin
    });

    // agregar servicios
    for (const s of servicios) {
      await citasModel.addServicioToCita(cita.id, s);
    }

    res.status(201).json(cita);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creando la cita' });
  }
}

export async function modificarCita(req, res) {
  try {
    const id = req.params.id;
    const { fecha, hora_inicio, servicios } = req.body;

    const cita = await citasModel.getCitaById(id);
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });

    if (fecha && hora_inicio) {

      let servicioIds = servicios;

      if (!Array.isArray(servicios)) {
        const { rows } = await db.query(
          'SELECT servicio_id FROM cita_servicios WHERE cita_id = $1',
          [id]
        );
        servicioIds = rows.map(r => r.servicio_id);
      }

      const placeholders = servicioIds.map((_, i) => `$${i + 1}`).join(',');
      const servicioRows = await db.query(
        `SELECT id, duracion_minutos FROM servicios WHERE id IN (${placeholders})`,
        servicioIds
      );

      const totalMin = servicioRows.rows.reduce((s, r) => s + Number(r.duracion_minutos), 0);

      const [hh, mm] = hora_inicio.split(':').map(Number);

      const inicioDate = new Date(`${fecha}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`);
      const finDate = new Date(inicioDate.getTime() + totalMin * 60000);

      const hora_fin = `${String(finDate.getHours()).padStart(2, '0')}:${String(finDate.getMinutes()).padStart(2, '0')}:00`;
      const hora_inicio_sql = `${String(inicioDate.getHours()).padStart(2, '0')}:${String(inicioDate.getMinutes()).padStart(2, '0')}:00`;

      const overlap = await citasModel.hasOverlap(
        cita.especialista_id,
        fecha,
        hora_inicio_sql,
        hora_fin,
        id
      );

      if (overlap) return res.status(409).json({ message: 'El especialista tiene otra cita en ese horario' });

      await citasModel.updateCitaTimes(id, fecha, hora_inicio_sql, hora_fin);

      if (Array.isArray(servicios)) {
        await db.query('DELETE FROM cita_servicios WHERE cita_id = $1', [id]);

        for (const s of servicios) {
          await citasModel.addServicioToCita(id, s);
        }
      }

      const updated = await citasModel.getCitaById(id);
      return res.json(updated);
    }

    return res.status(400).json({ message: 'Enviar fecha y hora_inicio para reprogramar' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error modificando la cita' });
  }
}

export async function cancelarCita(req, res) {
  const id = req.params.id;
  const updated = await citasModel.updateCitaEstado(id, 'cancelada');
  res.json(updated);
}

export async function listarCitasPorFecha(req, res) {
  const fecha = req.query.fecha;
  if (!fecha) return res.status(400).json({ message: 'Fecha requerida (YYYY-MM-DD)' });

  const rows = await citasModel.listCitasByFecha(fecha);
  res.json(rows);
}
