const express = require('express');
const amqp = require('amqplib');
const app = express();
const port = 6000;

// Configurações do RabbitMQ
const tarefasExchangeName = 'tarefas_exchange';
const anotacoesExchangeName = 'anotacoes_exchange';

// Dados temporários para armazenar tarefas e anotações
const tarefas = [];
const anotacoesPorTarefaId = {};

// Conecta-se ao RabbitMQ
async function conectarAoRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Declaração da troca (exchange) para tarefas
    await channel.assertExchange(tarefasExchangeName, 'fanout', { durable: false });

    // Cria uma fila anônima exclusiva para receber eventos de tarefas
    const tarefasQueue = await channel.assertQueue('', { exclusive: true });

    // Liga a fila à troca (exchange) de tarefas
    channel.bindQueue(tarefasQueue.queue, tarefasExchangeName, '');

    // Callback chamada quando um evento de tarefa é recebido
    const callbackTarefa = (msg) => {
        const tarefa = JSON.parse(msg.content.toString());
        tarefas[tarefa.id] = tarefa;
    };

    // Registra o callback para processar eventos de tarefa
    channel.consume(tarefasQueue.queue, callbackTarefa, { noAck: true });

    // Declaração da troca (exchange) para anotações
    await channel.assertExchange(anotacoesExchangeName, 'fanout', { durable: false });

    // Cria uma fila anônima exclusiva para receber eventos de anotações
    const anotacoesQueue = await channel.assertQueue('', { exclusive: true });

    // Liga a fila à troca (exchange) de anotações
    channel.bindQueue(anotacoesQueue.queue, anotacoesExchangeName, '');

    // Callback chamada quando um evento de anotação é recebido
    const callbackAnotacao = (msg) => {
        const anotacao = JSON.parse(msg.content.toString());
        const tarefaId = anotacao.tarefaId;
        const anotacoesDaTarefa = anotacoesPorTarefaId[tarefaId] || [];
        anotacoesDaTarefa.push(anotacao);
        anotacoesPorTarefaId[tarefaId] = anotacoesDaTarefa;
    };

    // Registra o callback para processar eventos de anotação
    channel.consume(anotacoesQueue.queue, callbackAnotacao, { noAck: true });

}

// Rota para obter a coleção de tarefas com anotações
app.get('/colecao-tarefas', (req, res) => {
    const colecaoTarefas = Object.values(tarefas).map((tarefa) => {
        return {
            ...tarefa,
            anotacoes: anotacoesPorTarefaId[tarefa.id] || [],
        };
    });

    res.json(colecaoTarefas);
});

// Inicia o serviço de composição e aguarda eventos
conectarAoRabbitMQ().then(() => {
    app.listen(port, () => {
        console.log(`Serviço de Composição. Porta ${port}`);
    });
});
