const { Pool } = require('pg');

// Create a pool of connections
const pool = new Pool({
    user: 'ergyixoj',
    host: 'raja.db.elephantsql.com',
    database: 'ergyixoj',
    password: 'yiDfrYE6mlswsL3PLbl7Wr5VlDZcK_bO',
    port: 5432, 
});

// Function to execute queries
const query = (text, params) => pool.query(text, params);

module.exports = {
    query
};
