const user = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET; // Chave secreta para JWT

exports.register = async (req, res) => {
    try {
        const { name, email, password, contact, plate } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Campos obrigatórios em falta' });
        }

        const exists = await User.findOne({ where: { email } });
        if (exists) {
            return res.status(409).json({ error: 'Email já registado' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password_hash,
            contact
        });

        // Criar veículo automaticamente (se vier matrícula)
        if (plate) {
            const { Vehicle } = require('../models');

            await Vehicle.create({
                license_plate: plate,
                brand: 'Unknown',
                model: 'Unknown',
                color: 'Unknown',
                vehicle_type: 'Unknown',
                id_user: user.id_user
            });
        }

        return res.status(201).json({
            message: 'Utilizador criado',
            user: {
                id: user.id_user,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;
        
        const user = await User.findOne({where: {email}});

        if(!user){
            return res.status(401).json({error: 'Credenciais inválidas'});
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if(!validPassword){
            return res.status(401).json({error: 'Credenciais inválidas'});
        }

        // Gerar token JWT
        const token = jwt.sign(
            {id: user.id_user, role: user.role},
            SECRET,
            {expiresIN: '2h'}
        );

        // Resposta 
        return res.status(200).json({
            message: 'Login com sucesso',
            token,
            user:{
                id: user.id_user,
                name: user.name,
                role: user.role
            }
        });
   
    }catch(err){
        return res.status(500).json({error: err.message});
    }
}