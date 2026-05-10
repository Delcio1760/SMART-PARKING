const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('smartparking', 'root', 'Saleh 08', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

const User = require('./User')(sequelize);
const Vehicle = require('./Vehicle')(sequelize);
const ParkingPark = require('./ParkingPark')(sequelize);
const ParkingSpot = require('./ParkingSpot')(sequelize);
const Reservation = require('./Reservation')(sequelize);
const Payment = require('./Payment')(sequelize);
const FavoritePark = require('./FavoritePark')(sequelize);

// USER ↔ VEHICLES
User.hasMany(Vehicle, {
  foreignKey: 'id_user',
  onDelete: 'CASCADE'
});

Vehicle.belongsTo(User, {
  foreignKey: 'id_user'
});

// PARKING PARKS ↔ PARKING SPOTS
ParkingPark.hasMany(ParkingSpot, {
  foreignKey: 'id_park',
  onDelete: 'CASCADE'
});

ParkingSpot.belongsTo(ParkingPark, {
  foreignKey: 'id_park'
});

// USERS ↔ FAVORITE PARKS ↔ PARKING PARKS
User.belongsToMany(ParkingPark, {
  through: FavoritePark,
  foreignKey: 'id_user',
  otherKey: 'id_park'
});

ParkingPark.belongsToMany(User, {
  through: FavoritePark,
  foreignKey: 'id_park',
  otherKey: 'id_user'
});

User.hasMany(FavoritePark, {
  foreignKey: 'id_user',
  onDelete: 'CASCADE'
});

FavoritePark.belongsTo(User, {
  foreignKey: 'id_user'
});

ParkingPark.hasMany(FavoritePark, {
  foreignKey: 'id_park',
  onDelete: 'CASCADE'
});

FavoritePark.belongsTo(ParkingPark, {
  foreignKey: 'id_park'
});

// USERS ↔ VEHICLES ↔ RESERVATIONS
User.hasMany(Reservation, {
  foreignKey: 'id_user',
  onDelete: 'CASCADE'
});

Reservation.belongsTo(User, {
  foreignKey: 'id_user'
});

Vehicle.hasMany(Reservation, {
  foreignKey: 'id_vehicle',
  onDelete: 'CASCADE'
});

Reservation.belongsTo(Vehicle, {
  foreignKey: 'id_vehicle'
});

// PARKING SPOTS ↔ RESERVATIONS
ParkingSpot.hasMany(Reservation, {
  foreignKey: 'id_spot',
  onDelete: 'CASCADE'
});

Reservation.belongsTo(ParkingSpot, {
  foreignKey: 'id_spot'
});

// RESERVATIONS ↔ PAYMENTS
Reservation.hasOne(Payment, {
  foreignKey: 'id_reservation',
  onDelete: 'CASCADE'
});

Payment.belongsTo(Reservation, {
  foreignKey: 'id_reservation'
});

module.exports = {
  sequelize,
  User,
  Vehicle,
  ParkingPark,
  ParkingSpot,
  Reservation,
  Payment,
  FavoritePark
};

