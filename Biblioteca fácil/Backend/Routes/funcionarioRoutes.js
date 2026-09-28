const express = require('express');

const router = express.Router();

const funcionarioController = require('./../controllers/funcionarioController');

// ======================================================
// CRUD DE FUNCIONÁRIOS
// ======================================================

// Abre a página do CRUD de funcionários
router.get('/abrirCrudFuncionario', funcionarioController.abrirCrudFuncionario);

// Lista todos os funcionários
router.get(
    '/',
    funcionarioController.listarFuncionarios
);

// Cadastra um funcionário
router.post(
    '/',
    funcionarioController.criarFuncionario
);

// Busca um funcionário pelo CPF
router.get(
    '/:cpf',
    funcionarioController.obterFuncionario
);

// Atualiza um funcionário pelo CPF
router.put(
    '/:cpf',
    funcionarioController.atualizarFuncionario
);

// Exclui um funcionário pelo CPF
router.delete(
    '/:cpf',
    funcionarioController.deletarFuncionario
);

module.exports = router;