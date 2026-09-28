// Importa a função query do arquivo de conexão com o banco de dados
const { query } = require('../database');

// Importa o módulo path para trabalhar com caminhos de arquivos
const path = require('path');


// ============================================================
// ABRIR CRUD DE CLIENTE
// ============================================================

exports.abrirCrudCliente = (req, res) => {

  // Abre o arquivo HTML do CRUD de cliente
  res.sendFile(
    path.join(__dirname, '../../frontend/cliente/cliente.html')
  );

};


// ============================================================
// LISTAR CLIENTES
// ============================================================

exports.listarClientes = async (req, res) => {

  try {

    // Busca os clientes junto com os dados da pessoa
    const result = await query(
      `SELECT
        cli.cpf,
        p.nome,
        p.email,
        p.data_nascimento,
        cli.data_cadastro
      FROM cliente cli
      JOIN pessoa p
        ON cli.cpf = p.cpf
      ORDER BY cli.cpf`
    );

    // Retorna os clientes encontrados
    res.json(result.rows);

  } catch (error) {

    // Mostra o erro no terminal
    console.error('Erro ao listar clientes:', error);

    // Retorna erro para o frontend
    res.status(500).json({
      error: 'Erro interno do servidor'
    });

  }

};


// ============================================================
// CRIAR CLIENTE
// ============================================================

exports.criarCliente = async (req, res) => {

  try {

    // Pega os dados enviados pelo frontend
    const {
      cpf,
      data_cadastro
    } = req.body;


    // Verifica se o CPF foi informado
    if (!cpf) {

      return res.status(400).json({
        error: 'O CPF do cliente é obrigatório'
      });

    }


    // Verifica se a pessoa realmente existe
    const pessoaResult = await query(
      `SELECT cpf
       FROM pessoa
       WHERE cpf = $1`,
      [cpf]
    );


    if (pessoaResult.rows.length === 0) {

      return res.status(400).json({
        error: 'A pessoa informada não existe'
      });

    }


    // Verifica se a pessoa já é cliente
    const clienteExistente = await query(
      `SELECT cpf
       FROM cliente
       WHERE cpf = $1`,
      [cpf]
    );


    if (clienteExistente.rows.length > 0) {

      return res.status(409).json({
        error: 'Este CPF já está cadastrado como cliente'
      });

    }


    // Insere o cliente no banco de dados
    const result = await query(
      `INSERT INTO cliente
      (cpf, data_cadastro)
      VALUES ($1, $2)
      RETURNING *`,
      [
        cpf,
        data_cadastro
      ]
    );


    // Retorna o cliente criado
    res.status(201).json({
      sucesso: true,
      cliente: result.rows[0]
    });

  } catch (error) {

    // Mostra o erro no terminal
    console.error('Erro ao criar cliente:', error);


    // CPF já cadastrado
    if (error.code === '23505') {

      return res.status(409).json({
        error: 'Este CPF já está cadastrado como cliente'
      });

    }


    // Problema com chave estrangeira
    if (error.code === '23503') {

      return res.status(400).json({
        error: 'A pessoa informada não existe'
      });

    }


    // Campo obrigatório não informado
    if (error.code === '23502') {

      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });

    }


    // Retorna erro interno
    res.status(500).json({
      error: 'Erro interno do servidor'
    });

  }

};


// ============================================================
// OBTER CLIENTE PELO CPF
// ============================================================

exports.obterCliente = async (req, res) => {

  try {

    // Pega o CPF enviado na URL
    const cpf = req.params.id;


    // Procura o cliente pelo CPF
    const result = await query(
      `SELECT
        cli.cpf,
        p.nome,
        p.email,
        p.data_nascimento,
        cli.data_cadastro
      FROM cliente cli
      JOIN pessoa p
        ON cli.cpf = p.cpf
      WHERE cli.cpf = $1`,
      [cpf]
    );


    // Verifica se encontrou o cliente
    if (result.rows.length === 0) {

      return res.status(404).json({
        error: 'Cliente não encontrado'
      });

    }


    // Retorna o cliente encontrado
    res.json({
      sucesso: true,
      cliente: result.rows[0]
    });

  } catch (error) {

    // Mostra o erro no terminal
    console.error('Erro ao obter cliente:', error);

    // Retorna erro interno
    res.status(500).json({
      error: 'Erro interno do servidor'
    });

  }

};


// ============================================================
// ATUALIZAR CLIENTE
// ============================================================

exports.atualizarCliente = async (req, res) => {

  try {

    // Pega o CPF enviado na URL
    const cpf = req.params.id;


    // Pega os dados enviados pelo frontend
    const {
      data_cadastro
    } = req.body;


    // Verifica se o cliente existe
    const existingClientResult = await query(
      `SELECT *
       FROM cliente
       WHERE cpf = $1`,
      [cpf]
    );


    // Se não encontrou o cliente, retorna erro
    if (existingClientResult.rows.length === 0) {

      return res.status(404).json({
        error: 'Cliente não encontrado'
      });

    }


    // Atualiza o cliente no banco de dados
    const updateResult = await query(
      `UPDATE cliente
       SET data_cadastro = $1
       WHERE cpf = $2
       RETURNING *`,
      [
        data_cadastro,
        cpf
      ]
    );


    // Retorna o cliente atualizado
    res.json({
      sucesso: true,
      cliente: updateResult.rows[0]
    });

  } catch (error) {

    // Mostra o erro no terminal
    console.error('Erro ao atualizar cliente:', error);

    // Retorna erro interno
    res.status(500).json({
      error: 'Erro interno do servidor'
    });

  }

};


// ============================================================
// DELETAR CLIENTE
// ============================================================

exports.deletarCliente = async (req, res) => {

  // Pega o CPF enviado na URL
  const cpf = req.params.id;


  try {

    // Verifica se o cliente existe
    const existingClientResult = await query(
      `SELECT *
       FROM cliente
       WHERE cpf = $1`,
      [cpf]
    );


    // Se não encontrou o cliente
    if (existingClientResult.rows.length === 0) {

      return res.status(404).json({
        error: 'Cliente não encontrado'
      });

    }


    // Deleta o cliente
    await query(
      `DELETE FROM cliente
       WHERE cpf = $1`,
      [cpf]
    );


    // Retorna sucesso
    res.status(204).send();


  } catch (error) {

    // Verifica se existe outra tabela
    // que depende desse cliente
    if (error.code === '23503') {

      return res.status(409).json({
        error:
          'Erro de integridade referencial - o cliente não pode ser excluído, pois está associado a outras entidades.'
      });

    }


    // Retorna erro interno
    res.status(500).json({
      error:
        'Erro interno do servidor ao tentar excluir o cliente.'
    });

  }

};
