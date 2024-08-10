const pool = require('./database');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
    const { username } = req.body;
    const { password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [username, hashedPassword]
        );
        const userId = result.rows[0].id;
        res.json({ userId, message: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ error: 'User registration failed' });
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const userId = user.id;
            res.json({ userId, message: 'Login successful' });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: 'User login failed' });
    }
};
