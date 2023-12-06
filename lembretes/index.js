const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");

const lembretes = [];
let id = -1;
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

// Configurações do RabbitMQ
const exchangeName = "anotacoes_exchange";

// Função para enviar uma mensagem para o barramento de eventos
async function enviarEventoLembreteCriado(lembrete) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  // Declaração da troca (exchange)
  await channel.assertExchange(exchangeName, "fanout", { durable: false });

  // Publica a mensagem no tópico (exchange)
  channel.publish(exchangeName, "", Buffer.from(JSON.stringify(lembrete)));

  // Fecha a conexão
  await channel.close();
  await connection.close();
}

app.get("/get/lembrete", (req, res) => {
  res.send(lembretes);
});

app.post("/post/lembrete", async (req, res) => {
  id++;
  const lembrete = req.body;
  const novoLembrete = { id, lembrete };
  lembretes[id] = novoLembrete;

  await enviarEventoLembreteCriado(novoLembrete);

  res.status(201).send(novoLembrete);
  console.log(novoLembrete);
});

app.listen(5000, () => {
  console.log("Lembretes. Porta 5000");
});
