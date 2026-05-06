const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('smartparking', 'root', 'smartparking1760', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});


const User    = require('./User')(sequelize);
const Vehicle = require('./Vehicle')(sequelize);

// Associações 
User.hasMany(Vehicle,   { foreignKey: 'id_user', onDelete: 'CASCADE' });
Vehicle.belongsTo(User, { foreignKey: 'id_user' });

module.exports = { sequelize, User, Vehicle };