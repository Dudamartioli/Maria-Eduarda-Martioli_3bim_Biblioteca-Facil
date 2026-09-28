const express = require('express');

const router = express.Router();

const clienteController = require('./../controllers/clienteController');

// ======================================================
// CRUD DE CLIENTES
// ======================================================

// Abre a página do CRUD de clientes
router.get(
    '/abrirCrudCliente',
    clienteController.abrirCrudCliente
);

// Lista todos os clientes
router.get(
    '/',
    clienteController.listarClientes
);

// Cadastra um cliente
router.post(
    '/',
    clienteController.criarCliente
);

// Busca um cliente pelo CPF
router.get(
    '/:cpf',
    clienteController.obterCliente
);

// Atualiza um cliente pelo CPF
router.put(
    '/:cpf',
    clienteController.atualizarCliente
);

// Exclui um cliente pelo CPF
router.delete(
    '/:cpf',
    clienteController.deletarCliente
);

module.exports = router;
