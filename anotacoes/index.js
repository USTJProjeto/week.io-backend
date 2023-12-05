const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");

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

const anotacoesPorTarefaId = {};

// Configurações do RabbitMQ
const exchangeName = "anotacoes_exchange";

// Função para enviar uma mensagem para o barramento de eventos
async function enviarEventoAnotacaoCriada(anotacao) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  // Declaração da troca (exchange)
  await channel.assertExchange(exchangeName, "fanout", { durable: false });

  // Publica a mensagem no tópico (exchange)
  channel.publish(exchangeName, "", Buffer.from(JSON.stringify(anotacao)));

  // Fecha a conexão
  await channel.close();
  await connection.close();
}

app.get("/get/tarefas/:id/anotacoes", (req, res) => {
  res.send(anotacoesPorTarefaId);
});

app.post("/post/tarefas/:id/anotacoes", async (req, res) => {
  const idAnotacoes = uuidv4();
  const { anotacao } = req.body;

  const anotacoesDaTarefa = anotacoesPorTarefaId[req.params.id] || [];
  const novaAnotacao = { id: idAnotacoes, anotacao, tarefaId: req.params.id };
  anotacoesDaTarefa.push(novaAnotacao);
  anotacoesPorTarefaId[req.params.id] = anotacoesDaTarefa;

  // Envia a anotação criada para o barramento de eventos
  await enviarEventoAnotacaoCriada(novaAnotacao);

  res.status(201).send(anotacoesDaTarefa);
});

app.listen(5000, () => {
  console.log("Anotações. Porta 5000");
});
