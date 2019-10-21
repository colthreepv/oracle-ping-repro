require('dotenv').config();
const oracledb = require('oracledb');

async function ping (pool) {
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.ping();
  } catch (err) {
    await conn.release();
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (err) {
        console.log(err);
      }
    }
  }
}

async function checkDatabase (counterFn) {
  const id = counterFn();

  let pool
  try {
    pool = oracledb.getPool();
    await ping(pool);
    console.log(`[healthCheck ${id}] All good!`);
    // console.log(pool._logStats());
  } catch (err) {
    console.log(`[healthCheck ${id}] Error catched`);
    // if (pool) console.log(pool._logStats());
  }
}

const DB_CHECK_INTERVAL = 10 * 1000;

(async () => {
  const {
    ORACLE_USER,
    ORACLE_PASSWORD,
    ORACLE_CONNECT_STRING
  } = process.env;

  let counter = 0
  const increase = () => ++counter;

  try {
    await oracledb.createPool({
      user: ORACLE_USER,
      password: ORACLE_PASSWORD,
      connectString: ORACLE_CONNECT_STRING,
      poolMin: 1,
      _enableStats: true
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
  console.log('[Database] Connection established');

  setInterval(() => checkDatabase(increase), DB_CHECK_INTERVAL);
})();
