const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');

const app = express();
const port = 3000 || 3000;
app.use(bodyParser.json());

// Use routes
app.use('/auth', authRoutes);
app.use('/queue', queueRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
