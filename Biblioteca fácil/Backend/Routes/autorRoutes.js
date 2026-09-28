const express = require('express');
const router = express.Router();
const autorController = require('../controllers/autorController');

// Rotas do CRUD de Autores
router.get('/listar', autorController.listarAutores);
router.get('/:id', autorController.obterAutor);
router.post('/', autorController.criarAutor);
router.put('/:id', autorController.atualizarAutor);
router.delete('/:id', autorController.deletarAutor);

module.exports = router;