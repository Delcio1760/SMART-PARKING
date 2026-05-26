const { where } = require('sequelize');
const { Reservation, ParkingSpot, Vehicle} = require('../models');

// Criar Reserva
exports.createReservation = async (req, res) => {
    try{
        const{id_spot, id_vehicle, date, start_time, end_time} = req.body;

        if(!id_spot || !id_vehicle || !date || !start_time || !end_time){
            return res.status(400).json({error: 'Campos obrigatórios não preenchidos'});
        }

        // Verificar se o lugar existe e está disponível
        const spot = await ParkingSpot.findByPk(id_spot);
        if(!spot) return res.status(404).json({error: 'Lugar de estacionamento não encontrado'});
        if(spot.status !== 'free') return res.status(409).json({error: 'Lugar de estacionamento já ocupado'});

        // Vereficar se o veiculo já tem uma reserva ativa no mesmo horário
        const existing = await Reservation.findOne({
            where: {
                id_vehicle,
                date,
                status: 'active',
            }
        });
        if(existing)return res.status(409).json({error: 'Este veículo já possui uma reserva ativa para esta data'});

        // Criar a reserva
       const reservation = await Reservation.create({
            id_spot: Number(id_spot),
            id_vehicle: Number(id_vehicle),
            date: date,
            start_time: start_time,
            end_time: end_time,
            status: 'active'
        });

        // Atualizar o estado do lugar para ocupado
        await spot.update({status: 'occupied'});
        return res.status(201).json({message: 'Reserva criada com sucesso', reservation});
    
    }catch(err){
        return res.status(500).json({error: err.message})
    }
};

// Listar as reservas do utilizador
exports.getMyReservations = async(req, res) => {
   
    try{
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Utilizador não autenticado' });
        }

        // Vai buscar os veículos associados ao id_user 
        const vehicles = await Vehicle.findAll({ where: { id_user: userId } });
        
        // Mapeia os IDs dos veículos de forma segura
        const vehicleIds = vehicles.map(v => v.id_vehicle || v.id);
        
        // Se o utilizador não tiver veículos, retorna uma lista vazia de reservas imediatamente
        if (vehicleIds.length === 0) {
            return res.json([]);
        }

        const reservations = await Reservation.findAll({
            where: { id_vehicle: vehicleIds },
            include: [{ model: ParkingSpot }]
        });
        return res.json(reservations);
   
    }catch(err){
        console.log("\n❌ ====== ERRO DETECTADO NO BACKEND ======");
        console.log("Mensagem:", err.message);
        console.log("Stack Trace:", err);
        console.log("===========================================\n");

        return res.status(500).json({ error: err.message });
    }

}