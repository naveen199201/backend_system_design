const express = require('express');
const { handleRequest, logoutUser } =require('../queueController');

const router = express.Router();

router.post('/request', handleRequest);
router.post('/logout', logoutUser);

module.exports = router;
