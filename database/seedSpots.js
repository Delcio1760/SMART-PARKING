// 1º OBRIGATORIAMENTE CARREGAR O .ENV INDICANDO O CAMINHO CORRETO
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 2º IMPORTAR A INSTÂNCIA DO SEQUELIZE
const { sequelize } = require('../models/index');

async function seedSpots(){
    try{
        await sequelize.authenticate();
        console.log('MySQL conectado com sucesso à BD da professora!');

        // 3º IR BUSCAR OS MODELOS DIRETAMENTE DA INSTÂNCIA DO SEQUELIZE
        // Isto evita erros de importação do index.js!
        const ParkingPark = sequelize.models.ParkingPark;
        const ParkingSpot = sequelize.models.ParkingSpot;

        // Validar se o Sequelize carregou os modelos corretamente
        if (!ParkingPark || !ParkingSpot) {
            console.log("\n ERRO DE CONFIGURAÇÃO:");
            console.log("Os modelos 'ParkingPark' ou 'ParkingSpot' não foram carregados no Sequelize.");
            console.log("Modelos atualmente registados no teu projeto:", Object.keys(sequelize.models), "\n");
            process.exit(1);
        }

        // 4º BUSCAR OS PARQUES EXISTENTES NA BD DA PROFESSORA
        const parks = await ParkingPark.findAll({ raw: true }); 
        console.log(` Encontrados ${parks.length} parques na base de dados.`);

        // 5º LIMPAR LUGARES ANTIGOS NA BD DELA ANTES DE REPOVOAR
        console.log(' A limpar lugares antigos para o teu grupo...');
        await ParkingSpot.destroy({ where: {} });

        // 6º SEMEAR OS LUGARES (SPOTS)
        for(const park of parks){
            const spots = [];
            const total = park.total_capacity;

            for(let i = 1; i <= total; i++){
                let spot_type = 'normal';
                if(i > total - 3) spot_type = 'disabled';     // Últimas 3 vagas são para pessoas com deficiência
                else if(i > total - 8) spot_type = 'electric'; // Penúltimas 5 vagas são para veículos elétricos

                spots.push({
                    number: i,
                    status: 'free',
                    spot_type,
                    id_park: park.id_park
                });
            }
            
            await ParkingSpot.bulkCreate(spots);   
            console.log(`${total} lugares gerados e injetados para o parque: "${park.name}"`);
        }
        
    
        console.log('SEED COMPLETO! Os 320 lugares já estão na BD!');
        process.exit(0);

    } catch(err) {
        console.error('Erro durante o processo:', err.message);
        process.exit(1);
    }   
}

seedSpots();