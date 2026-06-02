// 1º OBRIGATORIAMENTE CARREGAR O .ENV
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 2º SÓ DEPOIS IMPORTAR OS MODELOS
const { faker } = require('@faker-js/faker');
const { sequelize, User, Vehicle } = require('../models/index');



async function semear() {
    try {
        await sequelize.authenticate();
        console.log("Conexão estabelecida!");

        await sequelize.sync({ force: true });
        console.log("Tabelas recriadas.");

        for (let i = 0; i < 200; i++) {
            const novoUtilizador = await User.create({
                name:          faker.person.fullName(),
                email:         faker.internet.email(),
                password_hash: '123456'
            });

            await Vehicle.create({
                license_plate: faker.vehicle.vrm(),
                brand:         faker.vehicle.manufacturer(),
                model:         faker.vehicle.model(),
                color:         faker.color.human(),
                vehicle_type:  'Gasolina',
                id_user:       novoUtilizador.id_user // <-- usa a PK do utilizador criado para a FK do veículo
            });
        }

        console.log("Seeding concluído!");
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        await sequelize.close();
    }
}

semear();