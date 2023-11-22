var bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const tarefas = {};
contador = 0;

app.get("/get/tarefas", (req, res) => {
  res.send(tarefas);
});

app.post("/post/tarefas", (req, res) => {
  contador++;
  console.log(JSON.stringify(req.body));
  const tarefa = req.body;
  tarefas[contador] = {
    tarefa,
  };
  res.status(201).send(tarefas[contador]);
});

app.listen(4000, () => {
  console.log("tarefas. Porta 4000");
});
