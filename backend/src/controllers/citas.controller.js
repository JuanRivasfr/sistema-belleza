import db from '../config/db.js';
import * as citasModel from '../models/citas.model.js';

/**
 * Crear cita (solo ADMIN)
 */
export async function crearCita(req, res) {
  try {
    const { cliente_id, especialista_id, fecha, hora_inicio, servicios } = req.body;

    if (!cliente_id || !especialista_id || !fecha || !hora_inicio || !Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    // validar existencia y duración de servicios
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

    // crear cita + servicios en una sola transacción
    const cita = await citasModel.createCitaWithServicios({
      cliente_id,
      especialista_id,
      fecha,
      hora_inicio: hora_inicio_sql,
      hora_fin,
      servicios,
    });

    res.status(201).json(cita);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creando la cita' });
  }
}

export async function modificarCita(req, res) {
  try {
    const id = req.params.id;
    const { fecha, hora_inicio, servicios, especialista_id, cliente_id } = req.body;

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

      // usar el especialista destino si se pasa, si no el actual de la cita
      const targetEspecialista = especialista_id || cita.especialista_id;

      const overlap = await citasModel.hasOverlap(
        targetEspecialista,
        fecha,
        hora_inicio_sql,
        hora_fin,
        id
      );

      if (overlap) return res.status(409).json({ message: 'El especialista tiene otra cita en ese horario' });

      // actualizar cita incluyendo cliente/especialista (si vienen) y tiempos
      await citasModel.updateCitaFields(
        id,
        cliente_id || cita.cliente_id,
        targetEspecialista,
        fecha,
        hora_inicio_sql,
        hora_fin
      );

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

export async function getDisponibilidadEspecialista(req, res) {
  try {
    const especialistaId = req.params.id;
    const fecha = req.query.fecha; // YYYY-MM-DD
    const duracion = Number(req.query.duracion) || 0; // minutos
    if (!fecha || !especialistaId || !duracion) return res.status(400).json({ message: 'especialista, fecha y duracion son requeridos' });

    const day = new Date(`${fecha}T00:00:00`).getDay(); // 0-6

    // obtener turnos del especialista para ese día
    const { rows: turnos } = await db.query(
      `SELECT hora_inicio, hora_fin FROM turnos WHERE especialista_id = $1 AND dia_semana = $2 ORDER BY hora_inicio`,
      [especialistaId, day]
    );

    // obtener citas existentes del especialista en la fecha
    const { rows: citas } = await db.query(
      `SELECT hora_inicio, hora_fin FROM citas WHERE especialista_id = $1 AND fecha = $2 ORDER BY hora_inicio`,
      [especialistaId, fecha]
    );

    const toMinutes = (t) => {
      const [hh, mm] = t.split(':').map(Number);
      return hh * 60 + mm;
    };
    const toHHMMSS = (m) => {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      return `${hh}:${mm}:00`;
    };

    const slots = [];
    for (const t of turnos) {
      let cursor = toMinutes(t.hora_inicio);
      const end = toMinutes(t.hora_fin);

      // citas busy dentro del turno
      const busy = citas
        .map(c => ({ start: toMinutes(c.hora_inicio), end: toMinutes(c.hora_fin) }))
        .filter(b => b.end > cursor && b.start < end)
        .sort((a, b) => a.start - b.start);

      for (const b of busy) {
        // espacio libre entre cursor y b.start
        if (b.start - cursor >= duracion) {
          for (let s = cursor; s + duracion <= b.start; s += 15) {
            slots.push(toHHMMSS(s));
          }
        }
        cursor = Math.max(cursor, b.end);
      }

      // espacio final del turno
      if (end - cursor >= duracion) {
        for (let s = cursor; s + duracion <= end; s += 15) {
          slots.push(toHHMMSS(s));
        }
      }
    }

    return res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error calculando disponibilidad' });
  }
}

// ====================== nuevo ======================
export async function deleteCita(req, res) {
  try {
    const id = req.params.id;
    const deleted = await citasModel.deleteCita(id);
    if (!deleted) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json({ message: 'Cita eliminada', cita: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la cita' });
  }
}

