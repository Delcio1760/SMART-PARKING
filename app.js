const express = require('express');
const app = express();

app.use(express.json());

//rotas
app.use('/users', require('./routes/users'));
app.use('/vehicles', require('./routes/vehicles'));

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});