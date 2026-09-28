const { query } = require('../database');
const path = require('path');


// Abre a página do CRUD de funcionários
exports.abrirCrudFuncionario = (req, res) => {

    const usuario = req.cookies ? req.cookies.usuarioLogado : null;

    if (usuario) {
        res.sendFile(
            path.join(__dirname, '../../frontend/funcionario/funcionario.html')
        );
    } else {
        res.redirect('/login');
    }
};


// Lista todos os funcionários
exports.listarFuncionarios = async (req, res) => {

    try {

        const result = await query(`
            SELECT
                f.cpf,
                p.nome,
                p.email,
                p.data_nascimento,
                f.salario,
                f.nome_cargo,
                f.data_admissao
            FROM funcionario f
            INNER JOIN pessoa p
                ON f.cpf = p.cpf
            ORDER BY f.cpf
        `);

        res.json({
            sucesso: true,
            funcionarios: result.rows
        });

    } catch (error) {

        console.error('Erro ao listar funcionários:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
};


// Cadastra um funcionário
exports.criarFuncionario = async (req, res) => {

    try {

        const {
            cpf,
            salario,
            nome_cargo,
            data_admissao
        } = req.body;


        // Verifica se os campos obrigatórios foram preenchidos
        if (!cpf || !salario || !nome_cargo || !data_admissao) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos obrigatórios'
            });
        }


        // Insere o funcionário
        const result = await query(`
            INSERT INTO funcionario
                (cpf, salario, nome_cargo, data_admissao)
            VALUES
                ($1, $2, $3, $4)
            RETURNING *
        `, [
            cpf,
            salario,
            nome_cargo,
            data_admissao
        ]);


        res.status(201).json({
            sucesso: true,
            funcionario: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao criar funcionário:', error);


        // CPF não encontrado na tabela pessoa
        if (error.code === '23503') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O CPF informado não está cadastrado em pessoa ou o cargo informado não existe'
            });
        }


        // Funcionário com esse CPF já existe
        if (error.code === '23505') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Já existe um funcionário cadastrado com esse CPF'
            });
        }


        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
};


// Busca um funcionário pelo CPF
exports.obterFuncionario = async (req, res) => {

    try {

        const cpf = req.params.cpf;


        const result = await query(`
            SELECT
                f.cpf,
                p.nome,
                p.email,
                p.data_nascimento,
                f.salario,
                f.nome_cargo,
                f.data_admissao
            FROM funcionario f
            INNER JOIN pessoa p
                ON f.cpf = p.cpf
            WHERE f.cpf = $1
        `, [cpf]);


        if (result.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Funcionário não encontrado'
            });
        }


        res.json({
            sucesso: true,
            funcionario: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao obter funcionário:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
};


// Atualiza um funcionário
exports.atualizarFuncionario = async (req, res) => {

    try {

        const cpf = req.params.cpf;

        const {
            salario,
            nome_cargo,
            data_admissao
        } = req.body;


        // Verifica se o funcionário existe
        const funcionarioExistente = await query(`
            SELECT *
            FROM funcionario
            WHERE cpf = $1
        `, [cpf]);


        if (funcionarioExistente.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Funcionário não encontrado'
            });
        }


        // Atualiza os dados
        const result = await query(`
            UPDATE funcionario
            SET
                salario = $1,
                nome_cargo = $2,
                data_admissao = $3
            WHERE cpf = $4
            RETURNING *
        `, [
            salario,
            nome_cargo,
            data_admissao,
            cpf
        ]);


        res.json({
            sucesso: true,
            funcionario: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao atualizar funcionário:', error);


        if (error.code === '23503') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O cargo informado não existe'
            });
        }


        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
};


// Exclui um funcionário
exports.deletarFuncionario = async (req, res) => {

    try {

        const cpf = req.params.cpf;


        // Verifica se o funcionário existe
        const funcionarioExistente = await query(`
            SELECT *
            FROM funcionario
            WHERE cpf = $1
        `, [cpf]);


        if (funcionarioExistente.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Funcionário não encontrado'
            });
        }


        // Exclui o funcionário
        await query(`
            DELETE FROM funcionario
            WHERE cpf = $1
        `, [cpf]);


        res.json({
            sucesso: true,
            mensagem: 'Funcionário excluído com sucesso'
        });

    } catch (error) {

        console.error('Erro ao deletar funcionário:', error);


        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
};
