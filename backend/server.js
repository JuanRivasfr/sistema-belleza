import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth.routes.js';
import clientesRoutes from './src/routes/clientes.routes.js';
import serviciosRoutes from './src/routes/servicios.routes.js';
import citasRoutes from './src/routes/citas.routes.js';
import pagosRoutes from './src/routes/pagos.routes.js';
import reportesRoutes from './src/routes/reportes.routes.js';
import empleadosRoutes from './src/routes/empleados.routes.js';
import 'dotenv/config'; 


const app = express();
app.use(cors());
app.use(express.json());


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/pagos', pagosRoutes); // <-- registrar ruta de pagos
app.use('/api/empleados', empleadosRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});

