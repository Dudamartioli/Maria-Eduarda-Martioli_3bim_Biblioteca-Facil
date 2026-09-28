const { query } = require('../database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


// ======================================================
// LISTAR TODOS OS LIVROS
// ======================================================

exports.listarLivros = async (req, res) => {

    try {

        const result = await query(
            'SELECT * FROM public.livro ORDER BY issn'
        );

        res.json({
            sucesso: true,
            livros: result.rows
        });

    } catch (error) {

        console.error('Erro ao listar livros:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar livros.'
        });
    }
};


// ======================================================
// OBTER LIVRO PELO ISSN
// ======================================================

exports.obterLivro = async (req, res) => {

    try {

        // Pega o ISSN que veio pela URL
        const issn = parseInt(req.params.id, 10);

        // Verifica se é um número
        if (isNaN(issn)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ISSN inválido.'
            });
        }

        const result = await query(
            'SELECT * FROM public.livro WHERE issn = $1',
            [issn]
        );

        // Verifica se encontrou o livro
        if (result.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Livro não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            livro: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao obter livro:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        });
    }
};


// ======================================================
// CRIAR LIVRO
// ======================================================

exports.criarLivro = async (req, res) => {

    try {

        const {
            id_livro,
            nome_livro,
            id_autor,
            id_editora,
            ano_publicacao
        } = req.body;


        // O JS envia id_livro,
        // mas o banco utiliza a coluna issn.
        const issn = id_livro;


        // Verifica se o nome foi informado
        if (!nome_livro) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O nome do livro é obrigatório.'
            });
        }


        const sql = `
            INSERT INTO public.livro
            (
                issn,
                nome_livro,
                id_autor,
                id_editora,
                ano_publicacao
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;


        const values = [
            issn,
            nome_livro,
            id_autor || null,
            id_editora || null,
            ano_publicacao || 0
        ];


        const result = await query(sql, values);


        res.status(201).json({
            sucesso: true,
            mensagem: 'Livro inserido com sucesso!',
            livro: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao criar livro:', error);


        // Violação de chave estrangeira
        if (error.code === '23503') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O autor ou a editora informada não existe.'
            });
        }


        // Violação de chave primária / UNIQUE
        if (error.code === '23505') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Esse ISSN já está cadastrado.'
            });
        }


        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao inserir livro no banco de dados.'
        });
    }
};


// ======================================================
// ATUALIZAR LIVRO
// ======================================================

exports.atualizarLivro = async (req, res) => {

    try {

        // Pega o ISSN que veio pela URL
        const issn = parseInt(req.params.id, 10);


        // Pega os dados enviados pelo JS
        const {
            nome_livro,
            id_autor,
            id_editora,
            ano_publicacao
        } = req.body;


        // Verifica se o ISSN é válido
        if (isNaN(issn)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ISSN inválido.'
            });
        }


        const sql = `
            UPDATE public.livro
            SET
                nome_livro = $1,
                id_autor = $2,
                id_editora = $3,
                ano_publicacao = $4
            WHERE issn = $5
            RETURNING *
        `;


        const values = [
            nome_livro,
            id_autor || null,
            id_editora || null,
            ano_publicacao || 0,
            issn
        ];


        const result = await query(sql, values);


        // Verifica se encontrou o livro
        if (result.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Livro não encontrado.'
            });
        }


        res.json({
            sucesso: true,
            mensagem: 'Livro alterado com sucesso!',
            livro: result.rows[0]
        });

    } catch (error) {

        console.error('Erro ao atualizar livro:', error);


        if (error.code === '23503') {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'O autor ou a editora informada não existe.'
            });
        }


        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar livro.'
        });
    }
};


// ======================================================
// UPLOAD DA IMAGEM
// ======================================================

exports.uploadImagem = async (req, res) => {

    try {

        // Pega o ISSN da URL
        const issn = req.params.id;


        // Verifica se foi enviada uma imagem
        if (!req.file) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhum arquivo enviado.'
            });
        }


        // Pasta onde as imagens serão salvas
        const pastaImagens =
            path.join(__dirname, '../../imagens');


        // Se a pasta não existir, cria
        if (!fs.existsSync(pastaImagens)) {

            fs.mkdirSync(
                pastaImagens,
                {
                    recursive: true
                }
            );
        }


        // Nome do arquivo:
        // exemplo: 123.png
        const caminhoDestino =
            path.join(
                pastaImagens,
                `${issn}.png`
            );


        // Converte a imagem para PNG
        // e deixa com tamanho 300x300
        await sharp(req.file.buffer)
            .resize(
                300,
                300,
                {
                    fit: 'cover'
                }
            )
            .toFormat('png')
            .toFile(caminhoDestino);


        res.json({
            sucesso: true,
            mensagem: 'Imagem salva com sucesso!'
        });

    } catch (error) {

        console.error(
            'Erro ao salvar imagem:',
            error
        );

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao processar imagem.'
        });
    }
};


// ======================================================
// DELETAR LIVRO
// ======================================================

exports.deletarLivro = async (req, res) => {

    try {

        // Pega o ISSN da URL
        const issn =
            parseInt(req.params.id, 10);


        if (isNaN(issn)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'ISSN inválido.'
            });
        }


        // Deleta o livro do banco
        const result = await query(
            'DELETE FROM public.livro WHERE issn = $1 RETURNING *',
            [issn]
        );


        // Verifica se o livro existia
        if (result.rows.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Livro não encontrado.'
            });
        }


        // Caminho da imagem
        const imgPath =
            path.join(
                __dirname,
                '../../imagens',
                `${issn}.png`
            );


        // Se existir imagem, exclui
        if (fs.existsSync(imgPath)) {

            fs.unlinkSync(imgPath);
        }


        res.json({
            sucesso: true,
            mensagem: 'Livro excluído com sucesso!'
        });

    } catch (error) {

        console.error(
            'Erro ao deletar livro:',
            error
        );

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao excluir livro.'
        });
    }
};