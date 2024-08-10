const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000 || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
const db = require('./db');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const users = [];

// Routes
app.get('/', (req, res) => {
    res.send('Welcome! <a href="/register">Register</a> | <a href="/login">Login</a>');
});

// Register Route
app.get('/register', (req, res) => {
    res.send('<form action="/register" method="post"><input type="text" name="username" placeholder="Username" required><input type="password" name="password" placeholder="Password" required><button type="submit">Register</button></form>');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await db.query('SELECT * FROM User WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            return res.send('User already exists. <a href="/register">Register</a> | <a href="/login">Login</a>');
        }

        await db.query('INSERT INTO User (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        res.send('Registration successful! <a href="/login">Login</a>');
    } catch (err) {
        res.send('Error occurred. <a href="/register">Register</a> | <a href="/login">Login</a>');
    }
});

// Login Route
app.get('/login', (req, res) => {
    res.send('<form action="/login" method="post"><input type="text" name="username" placeholder="Username" required><input type="password" name="password" placeholder="Password" required><button type="submit">Login</button></form>');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.send('User not found. <a href="/login">Login</a> | <a href="/register">Register</a>');
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.send('Invalid credentials. <a href="/login">Login</a> | <a href="/register">Register</a>');
    }

    // Set session
    req.session.user = user;
    console.log('user:', user.username)
    res.send('Login successful!<a href="/protected">Go to protected page</a> | <a href="/logout">Logout</a>');
});

// Protected Route
app.get('/protected', (req, res) => {
    if (!req.session.user) {
        return res.send('You must log in first. <a href="/login">Login</a>');
    }
    res.send(`Welcome, ${req.session.user.username}! <a href="/logout">Logout</a>`);
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out successfully. <a href="/login">Login</a>|<a href="/register">Register</a>');
});

// Start the Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
