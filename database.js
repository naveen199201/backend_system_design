const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgres://ergyixoj:yiDfrYE6mlswsL3PLbl7Wr5VlDZcK_bO@raja.db.elephantsql.com/ergyixoj', // replace with actual credentials
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL...');
});

pool.on('error', (err) => {
    console.error('PostgreSQL error:', err);
});

module.exports = pool;
