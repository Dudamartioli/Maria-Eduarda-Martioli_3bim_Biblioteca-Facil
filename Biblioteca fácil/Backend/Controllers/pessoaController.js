const { query } = require('../database');
const path = require('path');

// ======================================================
// ABRIR CRUD
// ======================================================

exports.abrirCrudPessoa = (req, res) => {

    res.sendFile(
        path.join(__dirname, '../../frontend/pessoa/pessoa.html')
    );

};


// ======================================================
// LISTAR PESSOAS
// ======================================================

exports.listarPessoas = async (req, res) => {

    try {

        const result = await query(
            'SELECT * FROM pessoa ORDER BY cpf'
        );

        res.json({
            sucesso: true,
            pessoas: result.rows
        });

    } catch (error) {

        console.error('Erro ao listar pessoas:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });

    }

};


// ======================================================
// CRIAR PESSOA
// ======================================================

exports.criarPessoa = async (req, res) => {

    try {

        const { cpf, nome, email, data_nascimento } = req.body;

        // Verifica se todos os campos foram preenchidos
        if (!cpf || !nome || !email || !data_nascimento) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF, nome, email e data de nascimento são obrigatórios'
            });

        }

        // Transforma o CPF em texto
        const cpfTexto = String(cpf);

        // Verifica se possui 11 números
        if (cpfTexto.length !== 11) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF deve possuir 11 números'
            });

        }

        // Verifica se possui somente números
        for (let i = 0; i < cpfTexto.length; i++) {

            if (cpfTexto[i] < '0' || cpfTexto[i] > '9') {

                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'CPF deve conter apenas números'
                });

            }

        }

        // Verifica o email
        if (!email.includes('@') || !email.includes('.')) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Formato de email inválido'
            });

        }

        const result = await query(
            `INSERT INTO pessoa
                (cpf, nome, email, data_nascimento)
             VALUES
                ($1, $2, $3, $4)
             RETURNING *`,
            [cpfTexto, nome, email, data_nascimento]
        );

        res.status(201).json({
            sucesso: true,
            pessoa: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao criar pessoa:', error);

        if (error.code === '23505') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF ou email já está cadastrado'
            });

        }

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });

    }

};


// ======================================================
// BUSCAR PESSOA PELO CPF
// ======================================================

exports.obterPessoa = async (req, res) => {

    try {

        // Pega o CPF que veio na URL
        const cpf = String(req.params.id);

        // Verifica se possui 11 números
        if (cpf.length !== 11) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF deve possuir 11 números'
            });

        }

        const result = await query(
            'SELECT * FROM pessoa WHERE cpf = $1',
            [cpf]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pessoa não encontrada'
            });

        }

        res.json({
            sucesso: true,
            pessoa: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao obter pessoa:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });

    }

};


// ======================================================
// ATUALIZAR PESSOA
// ======================================================

exports.atualizarPessoa = async (req, res) => {

    try {

        const cpf = String(req.params.id);

        const { nome, email, data_nascimento } = req.body;

        // Verifica o CPF
        if (cpf.length !== 11) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF deve possuir 11 números'
            });

        }

        // Verifica os campos
        if (!nome || !email || !data_nascimento) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, email e data de nascimento são obrigatórios'
            });

        }

        // Verifica o email
        if (!email.includes('@') || !email.includes('.')) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Formato de email inválido'
            });

        }

        const pessoa = await query(
            'SELECT * FROM pessoa WHERE cpf = $1',
            [cpf]
        );

        if (pessoa.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pessoa não encontrada'
            });

        }

        const result = await query(
            `UPDATE pessoa
             SET nome = $1,
                 email = $2,
                 data_nascimento = $3
             WHERE cpf = $4
             RETURNING *`,
            [nome, email, data_nascimento, cpf]
        );

        res.json({
            sucesso: true,
            pessoa: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao atualizar pessoa:', error);

        if (error.code === '23505') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email já está em uso por outra pessoa'
            });

        }

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });

    }

};


// ======================================================
// DELETAR PESSOA
// ======================================================

exports.deletarPessoa = async (req, res) => {

    try {

        const cpf = String(req.params.id);

        // Verifica o CPF
        if (cpf.length !== 11) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF deve possuir 11 números'
            });

        }

        const pessoa = await query(
            'SELECT * FROM pessoa WHERE cpf = $1',
            [cpf]
        );

        if (pessoa.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pessoa não encontrada'
            });

        }

        await query(
            'DELETE FROM pessoa WHERE cpf = $1',
            [cpf]
        );

        res.json({
            sucesso: true,
            mensagem: 'Pessoa excluída com sucesso'
        });

    } catch (error) {

        console.error('Erro ao deletar pessoa:', error);

        if (error.code === '23503') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Não é possível deletar pessoa com dependências associadas'
            });

        }

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });

    }

};


// ======================================================
// BUSCAR PESSOA PELO EMAIL
// ======================================================

exports.obterPessoaPorEmail = async (req, res) => {

    try {

        const email = req.params.email;

        if (!email) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email é obrigatório'
            });

        }

        const result = await query(
            'SELECT * FROM pessoa WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pessoa não encontrada'
            });

        }

        res.json({
            sucesso: true,
            pessoa: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao obter pessoa por email:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });

    }

};
