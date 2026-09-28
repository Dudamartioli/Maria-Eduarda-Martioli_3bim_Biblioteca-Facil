const express = require('express');
const cors = require('cors');
const path = require('path');

// Importa a função de consulta do banco
const { query } = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// Servir imagens estáticas
app.use('/imagens', express.static(path.join(__dirname, '../imagens')));


// ======================================================
// ROTAS
// ======================================================

// Cliente
// Tem que vir antes de pessoaRoutes porque cliente trabalha
// com os dados específicos de cliente.
const clienteRoutes = require('./routes/clienteRoutes');
app.use('/cliente', clienteRoutes);


// Funcionário
// Tem que vir antes de pessoaRoutes porque funcionário
// trabalha com os dados específicos de funcionário.
const funcionarioRoutes = require('./routes/funcionarioRoutes');
app.use('/funcionario', funcionarioRoutes);

//Cargo
const cargoRoutes = require('./routes/cargoRoutes');
app.use('/cargo', cargoRoutes);


// Pessoa
// Fica depois das rotas específicas.
const pessoaRoutes = require('./routes/pessoaRoutes');
app.use('/pessoa', pessoaRoutes);


// ======================================================
// SERVIDOR
// ======================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {

    console.log('\n=================================');
    console.log(`🚀 Servidor executando na porta ${PORT}`);

    try {

        await query('SELECT 1');

        console.log(
            `✅ Banco de Dados ${process.env.DB_NAME} conectado com sucesso!`
        );

    } catch (error) {

        console.error(
            `❌ FALHA NA CONEXÃO COM O BANCO DE DADOS:`
        );

        console.error(`   Motivo: ${error.message}`);

        console.error(
            `👉 Ajuste o arquivo .env com a senha correta do seu PostgreSQL.`
        );
    }

    console.log('=================================\n');
});