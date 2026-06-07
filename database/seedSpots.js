require ('dotenv').config();
const {sequelize, ParkingPark, ParkingSpot} = require('../models');

async function seedSpots(){
    try{
        await sequelize.authenticate();
        console.log('MySQL conectado');

        // Buscar todos os parques de estacionamento
        const parks = await ParkingPark.findAll({raw: true});
        
        // Limpar lugares existentes para evitar duplicações
        await ParkingSpot.destroy({ where: {} });
        for(const park of parks){
            const spots = [];
            const total = park.total_capacity;

            for(let i=1; i<=total; i++){
                let spot_type = 'normal';
                if(i > total - 3) spot_type = 'disabled'; // Últimas 3 vagas são para pessoas com deficiência
                else if(i > total -8) spot_type = 'electric'; // penultimas 5 vagas são para veículos elétricos

                spots.push({
                    number : i,
                    status: 'free',
                    spot_type,
                    id_park: park.id_park
                });
            }
            await ParkingSpot.bulkCreate(spots);   
                console.log(`${total} lugares criados para o parque ${park.name}`);
                // O "bulkCreate" é um método do Sequelize que insere varios registros duma vez na BD
                // No nosso caso temos 320 lugares no total (80+60+60+60+60) — sem bulkCreate faria 320 chamadas à BD, com bulkCreate faz 5 (uma por parque)
            }
            console.log('Seed concluido!');
            process.exit(0);

        }catch(err){
        console.error('Erro:', err.message);
        process.exit(1);

    }   
}

seedSpots();