var bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const tarefas = [];
contador = 0;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get("/get/tarefas", (req, res) => {
  res.send(tarefas);
});

app.post("/post/tarefas", (req, res) => {
  contador++;
  console.log(JSON.stringify(req.body));
  const tarefa = req.body;
  tarefas.push(tarefa);
  res.status(201).send(tarefa);
});

app.listen(4000, () => {
  console.log("tarefas. Porta 4000");
});
