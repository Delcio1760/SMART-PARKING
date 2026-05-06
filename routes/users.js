const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');

//endpoints
router.post('/', ctrl.register);
router.post('/login', ctrl.login);

module.exports = router;