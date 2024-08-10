const pool = require('./database');
const redisClient = require('./redis');

exports.handleRequest = async (req, res) => {
    const { userId, request } = req.body;
    console.log(request);
    try {
        // Log the request in PostgreSQL
        await pool.query(
            'INSERT INTO request_logs (user_id, request) VALUES ($1, $2)',
            [userId, request]
        );

        // Add request to user's queue in Redis
        redisClient.rpush(`queue:${userId}`, JSON.stringify(request), (err, reply) => {
            if (err) {
                return res.status(500).json({ error: 'Error adding request to queue' });
            }
            processQueue(userId); // Trigger queue processing
            res.json({ message: 'Request added to queue' });
        });
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

const processQueue = (userId) => {
    redisClient.lpop(`queue:${userId}`, async (err, request) => {
        if (err) {
            console.log(`Error processing request for user ${userId}:`, err);
            return;
        }

        if (request) {
            const parsedRequest = JSON.parse(request);
            console.log(`Processing request for user ${userId}:`, parsedRequest);

            try {
                // Simulate request processing
                await handleRequestLogic(parsedRequest);

                // Update request log in PostgreSQL
                await pool.query(
                    'UPDATE request_logs SET status = $1 WHERE user_id = $2 AND request = $3',
                    ['processed', userId, JSON.stringify(parsedRequest)]
                );
                
                // Recurse to process the next request
                processQueue(userId);
            } catch (err) {
                console.log(`Failed to process request for user ${userId}:`, err);
            }
        } else {
            console.log(`Queue for user ${userId} is empty`);
        }
    });
};

const handleRequestLogic = (request) => {
    return new Promise((resolve) => {
        // Simulate request processing time
        setTimeout(() => {
            console.log('Processed:', request);
            resolve();
        }, 1000);
    });
};
