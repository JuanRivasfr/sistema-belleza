import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_4eHTz9JwmjuL@ep-broad-rain-a46zr9tv-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conectado a la base de datos Neon");
    client.release();
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
  }
})();

export default pool;
