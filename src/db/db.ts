import sql from 'mssql';
import { config } from '../config/env';

const poolPromise = new sql.ConnectionPool(config.db as any)
  .connect()
  .then(pool => {
    console.log('✅ Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err);
    throw err;
  });

export async function ejecutarSP(nombreSP: string, parametros: Record<string, any> = {}) {
  const pool = await poolPromise;
  const request = pool.request();
  Object.keys(parametros).forEach(key => {
    request.input(key, parametros[key]);
  });
  const result = await request.execute(nombreSP);
  return result.recordset;
}

export { sql };
