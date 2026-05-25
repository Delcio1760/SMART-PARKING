const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservationController');
const {authMiddleware} = require('../controllers/usercontroller');

router.post('/', authMiddleware, ctrl.createReservation);
router.get('/me', authMiddleware, ctrl.getMyReservations);

module.exports = router;
