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
            id_spot,
            id_vehicle,
            date,
            start_time,
            end_time,
            status: 'active',
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
        const vehicles = await Vehicle.findAll({where: {id_user: req.user.id}});
        const vehicleIds = vehicles.map(v => v.id);
        
        const reservations = await Reservation.findAll({
            where: {id_vehicle: vehicleIds},
            include:[{model: ParkingSpot}]
        });

        return res.json(reservaitons);

    }catch(err){
        return res.status(500).json({error: err.message})
    }

}