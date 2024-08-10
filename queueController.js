const pool = require('./database');
const redisClient = require('./redis');

// Function to handle incoming requests
exports.handleRequest = async (req, res) => {
    const { userId, request } = req.body;
    
    try {
        // Log the request in PostgreSQL
        await pool.query(
            'INSERT INTO request_logs (user_id, request) VALUES ($1, $2)',
            [userId, JSON.stringify(request)]
        );
        // Add request to user's queue in Redis
        await redisClient.rPush(`queue:${userId}`, JSON.stringify(request));
        res.json({ message: 'Request added to queue' });
        processQueue(userId); // Trigger queue processing
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to log request' });
    }
};

exports.logoutUser = (req, res) => {
const { userId } = req.body;

redisClient.del(`queue:${userId}`, (err, reply) => {
    if (err) {
        return res.status(500).json({ error: 'Error clearing user queue' });
    }
    res.json({ message: 'User logged out and queue cleared' });
});
};
// Function to process the queue for a given user
const processQueue = async (userId) => {
    try {
        const request = await redisClient.lPop(`queue:${userId}`);
        if (request) {
            const parsedRequest = JSON.parse(request);
            console.log(`Processing request for user ${userId}:`, parsedRequest);

            // Simulate request processing
            await handleRequest(parsedRequest);

            // Recurse to process the next request
            processQueue(userId);
        } else {
            console.log(`Queue for user ${userId} is empty`);
        }
    } catch (err) {
        console.log(`Error processing request for user ${userId}:`, err);
    }
};

// Mock function to handle the actual request processing
async function handleRequest(request) {
    // Simulate some processing (e.g., processing an order, updating profile, etc.)
    console.log("Handling request:", request);
    return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
}

exports.processQueue = processQueue;