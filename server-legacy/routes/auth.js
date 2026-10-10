const express = require('express')
const router = express.Router();
const googleLogin = require('../controllers/auth.controller.js');

router.get('/', (req, res) => [
    res.send('login')
])

router.get('/google', googleLogin)

module.exports = router
