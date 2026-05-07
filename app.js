require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

//middlewares
app.use(cors());

app.use(express.json());


//rotas
app.use('/users', require('./routes/users'));
//app.use('/vehicles', require('./routes/vehicles'));

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});