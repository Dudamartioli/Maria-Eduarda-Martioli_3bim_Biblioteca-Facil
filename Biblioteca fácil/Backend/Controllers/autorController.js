const { query } = require('../database');
const path = require('path');

exports.abrirCrudAutor = (req, res) => {
  const usuario = req.cookies.usuarioLogado; // O cookie deve conter o nome/ID do usuário

  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/autor/autor.html'));
  } else {
    res.redirect('/login');
  }
};

exports.listarAutores = async (req, res) => {
  try {
    const result = await query('SELECT * FROM autor ORDER BY id_autor');
  //  console.log('Resultado do SELECT:', result.rows);
    res.json({ sucesso: true, autores: result.rows });
  } catch (error) {
    console.error('Erro ao listar autores:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.criarAutor = async (req, res) => {
  try {
    const { id_autor, nome_autor } = req.body;

    // Validação básica
    if (!nome_autor) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do autor é obrigatório'
      });
    }

    const result = await query(
      'INSERT INTO autor (id_autor, nome_autor) VALUES ($1, $2) RETURNING *',
      [id_autor, nome_autor]
    );

    res.status(201).json({ sucesso: true, autor: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar autor:', error);

    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.obterAutor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM autor WHERE id_autor = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'autor não encontrado' });
    }

    res.json({ sucesso: true, autor: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter autor:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.atualizarAutor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_autor } = req.body;

    // Verifica se o autor existe
    const existingPersonResult = await query(
      'SELECT * FROM autor WHERE id_autor = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'autor não encontrado' });
    }

    // Constrói os campos para atualização
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nome_autor: nome_autor !== undefined ? nome_autor : currentPerson.nome_autor
    };

    // Atualiza o autor
    const updateResult = await query(
      'UPDATE autor SET nome_autor = $1 WHERE id_autor = $2 RETURNING *',
      [updatedFields.nome_autor, id]
    );

    res.json({ sucesso: true, autor: updateResult.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar autor:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.deletarAutor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verifica se o autor existe
    const existingPersonResult = await query(
      'SELECT * FROM autor WHERE id_autor = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'autor não encontrado' });
    }

    // Deleta o autor
    await query(
      'DELETE FROM autor WHERE id_autor = $1',
      [id]
    );

    res.json({ sucesso: true, mensagem: 'autor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar autor:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não é possível deletar autor com dependências associadas'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};