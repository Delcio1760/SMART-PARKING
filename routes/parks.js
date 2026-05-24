const express = require('express');
const router = express.Router();

const { ParkingPark } = require('../models');

router.get('/', async (req, res) => {

  try {

    const parks = await ParkingPark.findAll({
      raw: true
    });

    const formatted = parks.map(park => ({

      id: park.id_park,

      name: park.name,

      city: park.city,

      address: park.address,

      capacity: park.total_capacity,

      available: park.total_capacity,

      open: park.opening_time,

      close: park.closing_time,

      lat: Number(park.lat),

      lng: Number(park.lng),
      img: park.img || null
      

    }));

    res.json(formatted);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Erro ao buscar parques'
    });

  }

});

module.exports = router;