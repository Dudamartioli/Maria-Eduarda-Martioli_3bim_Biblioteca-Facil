const express = require('express');
const router = express.Router();
const editoraController = require('../controllers/editoraController');

// Rotas do CRUD de Cargos
router.get('/listar', editoraController.listarEditoras);
router.get('/:id', editoraController.obterEditora);
router.post('/', editoraController.criarEditora);
router.put('/:id', editoraController.atualizarEditora);
router.delete('/:id', editoraController.deletarEditora);

module.exports = router;