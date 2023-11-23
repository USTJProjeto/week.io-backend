const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());

const tarefas = {};
let contador = 0;

// Configurações do RabbitMQ
const exchangeName = 'tarefas_exchange';

// Função para enviar uma mensagem para o barramento de eventos
async function enviarEventoTarefaCriada(tarefa) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Declaração da troca (exchange)
    await channel.assertExchange(exchangeName, 'fanout', { durable: false });

    // Publica a mensagem no tópico (exchange)
    channel.publish(exchangeName, '', Buffer.from(JSON.stringify(tarefa)));

    // Fecha a conexão
    await channel.close();
    await connection.close();
}

app.get('/tarefas', (req, res) => {
    res.send(tarefas);
});

app.post('/tarefas', async (req, res) => {
    contador++;
    const { texto } = req.body;
    const novaTarefa = { contador, texto };

    // Adiciona a tarefa ao objeto de tarefas
    tarefas[contador] = novaTarefa;

    // Envia a tarefa criada para o barramento de eventos
    await enviarEventoTarefaCriada(novaTarefa);

    res.status(201).send(novaTarefa);
});

app.listen(4000, () => {
    console.log('Tarefas. Porta 4000');
});
