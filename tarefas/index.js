const express = require('express');
const axios = require ('axios');
const app = express();
app.use(express.json());
const tarefas = {};
contador = 0;

app.get('/tarefas', (req, res) => {
    res.send(tarefas);
});


app.post('/tarefas', async (req, res) => {
    contador++;
    const { nome } = req.body;
    const { data } = req.body;
    const { categoria } = req.body;
    const { cor } = req.body;
    const { descricao } = req.body;
    tarefas[contador] = {
        contador, nome, data, categoria, cor, descricao
    }
    res.status(201).send(tarefas[contador]);
});

app.listen(4000, () => {
    console.log('tarefas. Porta 4000');
});