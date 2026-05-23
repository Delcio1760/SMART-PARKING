const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usercontroller');

//endpoints
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/me/vehicles', ctrl.authMiddleware, ctrl.addVehicle);

module.exports = router;