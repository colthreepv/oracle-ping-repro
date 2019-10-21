require('dotenv').config();
const oracledb = require('oracledb');

async function ping (pool) {
  let conn;

  try {
    conn = await pool.getConnection();
    return conn.ping();
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.log(err);
      }
    }
  }
}

async function checkDatabase () {
  const pool = oracledb.getPool();
  try {
    await ping(pool);
  } catch (err) {
    console.log('[healthCheck] Error catched');
    console.log(pool._logStats());
  }
}

const DB_CHECK_INTERVAL = 10 * 1000;

(async () => {
  const {
    ORACLE_USER,
    ORACLE_PASSWORD,
    ORACLE_CONNECT_STRING
  } = process.env;

  await oracledb.createPool({
    user: ORACLE_USER,
    password: ORACLE_PASSWORD,
    connectString: ORACLE_CONNECT_STRING,
    _enableStats: true
  });
  console.log('[Database] Connection established');

  setInterval(checkDatabase, DB_CHECK_INTERVAL);
})();
