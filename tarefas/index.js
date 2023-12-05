const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

const tarefas = [];
let id = -1;

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

app.get('/get/tarefas', (req, res) => {
    res.send(tarefas);
});

app.post('/post/tarefas', async (req, res) => {
    id++;
    const tarefa = req.body;

    const novaTarefa = { id, tarefa };

    // Adiciona a tarefa ao objeto de tarefas
    tarefas[id] = novaTarefa;

    // Envia a tarefa criada para o barramento de eventos
    await enviarEventoTarefaCriada(novaTarefa);

    res.status(201).send(novaTarefa);
});

app.listen(4000, () => {
    console.log('Tarefas. Porta 4000');
});
