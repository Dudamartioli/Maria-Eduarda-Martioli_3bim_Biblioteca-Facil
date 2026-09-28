const { query } = require('../database');
const path = require('path');

exports.abrirCrudEditora = (req, res) => {
  const usuario = req.cookies.usuarioLogado; // O cookie deve conter o nome/ID do usuário

  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/editora/editora.html'));
  } else {
    res.redirect('/login');
  }
};

exports.listarEditoras = async (req, res) => {
  try {
    const result = await query('SELECT * FROM editora ORDER BY id_editora');
  //  console.log('Resultado do SELECT:', result.rows);
    res.json({ sucesso: true, editoras: result.rows });
  } catch (error) {
    console.error('Erro ao listar editoras:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.criarEditora = async (req, res) => {
  try {
    const { id_editora, nome_editora } = req.body;

    // Validação básica
    if (!nome_editora) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do editora é obrigatório'
      });
    }

    const result = await query(
      'INSERT INTO editora (id_editora, nome_editora) VALUES ($1, $2) RETURNING *',
      [id_editora, nome_editora]
    );

    res.status(201).json({ sucesso: true, editora: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar editora:', error);

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

exports.obterEditora = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM editora WHERE id_editora = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'editora não encontrado' });
    }

    res.json({ sucesso: true, editora: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter editora:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.atualizarEditora = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_editora } = req.body;

    // Verifica se o editora existe
    const existingPersonResult = await query(
      'SELECT * FROM editora WHERE id_editora = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'editora não encontrado' });
    }

    // Constrói os campos para atualização
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nome_editora: nome_editora !== undefined ? nome_editora : currentPerson.nome_editora
    };

    // Atualiza o editora
    const updateResult = await query(
      'UPDATE editora SET nome_editora = $1 WHERE id_editora = $2 RETURNING *',
      [updatedFields.nome_editora, id]
    );

    res.json({ sucesso: true, editora: updateResult.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar editora:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};

exports.deletarEditora = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verifica se o editora existe
    const existingPersonResult = await query(
      'SELECT * FROM editora WHERE id_editora = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'editora não encontrado' });
    }

    // Deleta o editora
    await query(
      'DELETE FROM editora WHERE id_editora = $1',
      [id]
    );

    res.json({ sucesso: true, mensagem: 'editora excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar editora:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não é possível deletar editora com dependências associadas'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
};