const express = require('express');
const multer = require('multer');
const router = express.Router();
const livroController = require('../controllers/livroController');

// Configura o Multer para armazenar em memória temporária para o Sharp processar
const upload = multer({ storage: multer.memoryStorage() });

// Rotas do CRUD de livros
router.get('/listar', livroController.listarLivros);
router.get('/:id', livroController.obterLivro);
router.post('/', livroController.criarLivro);
router.put('/:id', livroController.atualizarLivro);
router.delete('/:id', livroController.deletarLivro);

// Rota para upload da imagem
router.post('/upload/:id', upload.single('imagem'), livroController.uploadImagem);

module.exports = router;