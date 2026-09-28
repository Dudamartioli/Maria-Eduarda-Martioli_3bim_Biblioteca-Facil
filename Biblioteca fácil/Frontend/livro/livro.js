// ======================================================
// CONFIGURAÇÕES
// ======================================================

// Endereço do servidor
const URL_API = 'http://localhost:3001';

// Endereço da imagem padrão
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

// Guarda a operação atual
let oQueEstaFazendo = '';

// Guarda o livro encontrado
let livro = null;


// ======================================================
// INICIALIZAÇÃO
// ======================================================

async function inicializar() {

    // O ISSN começa liberado para o usuário digitar
    document.getElementById("inputISSN_livro").readOnly = false;

    // Os outros campos começam bloqueados
    bloquearAtributos(true);

    // Mostra somente o botão Procure
    visibilidadeDosBotoes(
        'inline',
        'none',
        'none',
        'none',
        'none'
    );

    // Carrega os autores
    await carregarAutor();

    // Carrega as editoras
    await carregarEditora();

    // Lista os livros cadastrados
    await listar();

    // Mostra a imagem padrão
    carregarImagem(null);
}


// ======================================================
// CARREGAR AUTORES
// ======================================================

async function carregarAutor() {

    // Pega o select de autores
    const select = document.getElementById("selectAutor");

    try {

        // Busca os autores no servidor
        const resposta = await fetch(`${URL_API}/autor/listar`);

        // Converte a resposta para JSON
        const data = await resposta.json();

        // Verifica se deu certo
        if (data.sucesso) {

            // Limpa o select
            select.innerHTML =
                '<option value="">-- Selecione um Autor --</option>';

            // O controller retorna a lista como "autores"
            for (let autor of data.autores) {

                // Cria uma opção para cada autor
                select.innerHTML +=
                    `<option value="${autor.id_autor}">
                        ${autor.id_autor} - ${autor.nome_autor}
                    </option>`;
            }

        } else {

            // Mostra mensagem de erro
            select.innerHTML =
                '<option value="">Erro ao carregar autores</option>';
        }

    } catch (erro) {

        // Mostra o erro no console
        console.error("Erro ao carregar autores:", erro);

        // Mostra mensagem no select
        select.innerHTML =
            '<option value="">Erro ao carregar autores</option>';
    }
}


// ======================================================
// CARREGAR EDITORAS
// ======================================================

async function carregarEditora() {

    // Pega o select de editoras
    const select = document.getElementById("selectEditora");

    try {

        // Busca as editoras no servidor
        const resposta = await fetch(`${URL_API}/editora/listar`);

        // Converte a resposta para JSON
        const data = await resposta.json();

        // Verifica se deu certo
        if (data.sucesso) {

            // Limpa o select
            select.innerHTML =
                '<option value="">-- Selecione uma Editora --</option>';

            // Aceita "editoras" ou "editora"
            // dependendo de como seu controller retorna
            let listaEditoras = data.editoras || data.editora || [];

            // Percorre as editoras
            for (let editora of listaEditoras) {

                // Cria uma opção para cada editora
                select.innerHTML +=
                    `<option value="${editora.id_editora}">
                        ${editora.id_editora} - ${editora.nome_editora}
                    </option>`;
            }

        } else {

            // Mostra mensagem de erro
            select.innerHTML =
                '<option value="">Erro ao carregar editoras</option>';
        }

    } catch (erro) {

        // Mostra o erro no console
        console.error("Erro ao carregar editoras:", erro);

        // Mostra mensagem no select
        select.innerHTML =
            '<option value="">Erro ao carregar editoras</option>';
    }
}


// ======================================================
// CARREGAR IMAGEM
// ======================================================

function carregarImagem(issn) {

    // Pega a imagem do HTML
    const imagem = document.getElementById("imglivro");

    // Se não tiver ISSN, mostra a silhueta
    if (!issn) {

        imagem.src = SILHUETA_URL;

        return;
    }

    // Monta o caminho da imagem
    imagem.src =
        `${URL_API}/imagens/${issn}.png?t=${new Date().getTime()}`;

    // Se não encontrar a imagem, mostra a silhueta
    imagem.onerror = function () {

        imagem.src = SILHUETA_URL;
    };
}


// ======================================================
// ESCOLHER IMAGEM
// ======================================================

function acionarUpload() {

    // Só permite escolher imagem durante inserir ou alterar
    if (
        oQueEstaFazendo !== 'inserindo' &&
        oQueEstaFazendo !== 'alterando'
    ) {

        mostrarAviso(
            "Clique em Inserir ou Alterar primeiro para poder escolher uma imagem."
        );

        return;
    }

    // Abre a janela para escolher imagem
    document.getElementById("inputImagem").click();
}


// ======================================================
// PREVISUALIZAR IMAGEM
// ======================================================

function previewImagem() {

    // Pega o campo de imagem
    const input = document.getElementById("inputImagem");

    // Verifica se escolheu algum arquivo
    if (input.files.length > 0) {

        // Cria uma URL temporária
        const url = URL.createObjectURL(input.files[0]);

        // Mostra a imagem escolhida
        document.getElementById("imglivro").src = url;

        // Mostra aviso
        mostrarAviso(
            "Imagem escolhida! Clique em Salvar para concluir."
        );
    }
}


// ======================================================
// ENVIAR IMAGEM
// ======================================================

async function uploadImagemParaServidor(issn) {

    // Pega o campo de imagem
    const input = document.getElementById("inputImagem");

    // Se não escolheu imagem, não faz nada
    if (input.files.length === 0) {
        return;
    }

    // Cria um formulário
    const formData = new FormData();

    // Coloca a imagem no formulário
    formData.append("imagem", input.files[0]);

    try {

        // Envia a imagem
        const resposta = await fetch(
            `${URL_API}/livro/upload/${issn}`,
            {
                method: "POST",
                body: formData
            }
        );

        // Converte a resposta
        const data = await resposta.json();

        // Verifica se deu certo
        if (!data.sucesso) {

            console.error(
                "Erro ao enviar imagem:",
                data.mensagem
            );
        }

    } catch (erro) {

        // Mostra o erro
        console.error(
            "Erro ao enviar imagem:",
            erro
        );
    }
}


// ======================================================
// PROCURAR LIVRO NO BANCO
// ======================================================

async function procurePorChavePrimaria(issn) {

    try {

        // Busca o livro pelo ISSN
        const resposta =
            await fetch(`${URL_API}/livro/${issn}`);

        // Se retornou 404, não encontrou
        if (resposta.status === 404) {
            return null;
        }

        // Converte a resposta
        const data = await resposta.json();

        // Se encontrou o livro
        if (data.sucesso) {

            return data.livro;
        }

        return null;

    } catch (erro) {

        // Mostra o erro no console
        console.error(
            "Erro ao procurar livro:",
            erro
        );

        return null;
    }
}


// ======================================================
// PROCURAR
// ======================================================

async function procure() {

    // Pega o ISSN digitado
    const issn =
        document.getElementById("inputISSN_livro").value;

    // Verifica se está vazio
    if (issn === "") {

        mostrarAviso(
            "Informe o ISSN e clique em Procure."
        );

        return;
    }

    // Verifica se é número inteiro
    if (
        isNaN(issn) ||
        !Number.isInteger(Number(issn))
    ) {

        mostrarAviso(
            "O ISSN precisa ser um número inteiro."
        );

        return;
    }

    // Procura o livro
    livro = await procurePorChavePrimaria(issn);

    // Limpa a operação
    oQueEstaFazendo = '';

    // Se encontrou
    if (livro) {

        // Mostra os dados
        mostrarDadoslivro(livro);

        // Carrega a imagem
        carregarImagem(livro.issn);

        // Mostra Alterar e Excluir
        visibilidadeDosBotoes(
            'inline',
            'none',
            'inline',
            'inline',
            'none'
        );

        // Mostra aviso
        mostrarAviso(
            "Achou no banco, pode alterar ou excluir."
        );

    } else {

        // Limpa os outros campos
        limparAtributos();

        // Mantém o ISSN digitado
        document.getElementById(
            "inputISSN_livro"
        ).value = issn;

        // Libera o ISSN
        document.getElementById(
            "inputISSN_livro"
        ).readOnly = false;

        // Mostra a imagem padrão
        carregarImagem(null);

        // Mostra o botão Inserir
        visibilidadeDosBotoes(
            'inline',
            'inline',
            'none',
            'none',
            'none'
        );

        // Mostra aviso
        mostrarAviso(
            "Não achou no banco, pode inserir."
        );
    }
}


// ======================================================
// INSERIR
// ======================================================

function inserir() {

    // Libera os outros campos
    bloquearAtributos(false);

    // Libera o ISSN
    document.getElementById(
        "inputISSN_livro"
    ).readOnly = false;

    // Mostra Salvar e Cancelar
    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );

    // Guarda a operação
    oQueEstaFazendo = 'inserindo';

    // Mostra aviso
    mostrarAviso(
        "INSERINDO - Digite os dados do livro e clique em Salvar."
    );
}


// ======================================================
// ALTERAR
// ======================================================

function alterar() {

    // Libera os outros campos
    bloquearAtributos(false);

    // Não permite alterar o ISSN
    document.getElementById(
        "inputISSN_livro"
    ).readOnly = true;

    // Mostra Salvar e Cancelar
    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );

    // Guarda a operação
    oQueEstaFazendo = 'alterando';

    // Mostra aviso
    mostrarAviso(
        "ALTERANDO - Altere os dados e clique em Salvar."
    );
}


// ======================================================
// EXCLUIR
// ======================================================

function excluir() {

    // Bloqueia os campos
    bloquearAtributos(true);

    // Mantém o ISSN bloqueado
    document.getElementById(
        "inputISSN_livro"
    ).readOnly = true;

    // Mostra Salvar e Cancelar
    visibilidadeDosBotoes(
        'none',
        'none',
        'none',
        'none',
        'inline'
    );

    // Guarda a operação
    oQueEstaFazendo = 'excluindo';

    // Mostra aviso
    mostrarAviso(
        "EXCLUINDO - Clique em Salvar para confirmar a exclusão."
    );
}


// ======================================================
// SALVAR
// ======================================================

async function salvar() {

    // Pega o ISSN
    const issn =
        document.getElementById(
            "inputISSN_livro"
        ).value;

    // Pega o nome do livro
    const nome_livro =
        document.getElementById(
            "inputNome_livro"
        ).value;

    // Pega o autor
    const id_autor =
        document.getElementById(
            "selectAutor"
        ).value;

    // Pega a editora
    const id_editora =
        document.getElementById(
            "selectEditora"
        ).value;

    // Pega o ano
    const ano_publicacao =
        document.getElementById(
            "inputAno_publicacao"
        ).value;

    // Verifica o ISSN
    if (issn === "") {

        mostrarAviso(
            "Informe o ISSN."
        );

        return;
    }

    // Verifica o nome
    if (nome_livro === "") {

        mostrarAviso(
            "Informe o título do livro."
        );

        return;
    }

    // Verifica o autor
    if (id_autor === "") {

        mostrarAviso(
            "Selecione um autor."
        );

        return;
    }

    // Verifica a editora
    if (id_editora === "") {

        mostrarAviso(
            "Selecione uma editora."
        );

        return;
    }

    // Monta os dados
    const dadoslivro = {

        // O controller transforma isso em ISSN
        id_livro: issn,

        // Nome do livro
        nome_livro: nome_livro,

        // Autor
        id_autor: id_autor,

        // Editora
        id_editora: id_editora,

        // Ano
        ano_publicacao: ano_publicacao
    };

    try {

        // ==================================================
        // INSERIR
        // ==================================================

        if (oQueEstaFazendo === 'inserindo') {

            // Envia os dados
            const resposta = await fetch(
                `${URL_API}/livro`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(dadoslivro)
                }
            );

            // Converte a resposta
            const data = await resposta.json();

            // Verifica se deu certo
            if (!resposta.ok || !data.sucesso) {

                mostrarAviso(
                    data.mensagem ||
                    "Erro ao inserir livro."
                );

                return;
            }

            // Envia a imagem
            await uploadImagemParaServidor(issn);

            // Mostra mensagem
            mostrarAviso(
                "Inserido no Banco de Dados com sucesso!"
            );
        }


        // ==================================================
        // ALTERAR
        // ==================================================

        else if (oQueEstaFazendo === 'alterando') {

            // Atualiza os dados
            const resposta = await fetch(
                `${URL_API}/livro/${issn}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(dadoslivro)
                }
            );

            // Converte a resposta
            const data = await resposta.json();

            // Verifica se deu certo
            if (!resposta.ok || !data.sucesso) {

                mostrarAviso(
                    data.mensagem ||
                    "Erro ao alterar livro."
                );

                return;
            }

            // Envia nova imagem, se tiver
            await uploadImagemParaServidor(issn);

            // Mostra mensagem
            mostrarAviso(
                "Alterado no Banco de Dados com sucesso!"
            );
        }


        // ==================================================
        // EXCLUIR
        // ==================================================

        else if (oQueEstaFazendo === 'excluindo') {

            // Exclui o livro
            const resposta = await fetch(
                `${URL_API}/livro/${issn}`,
                {
                    method: 'DELETE'
                }
            );

            // Converte a resposta
            const data = await resposta.json();

            // Verifica se deu certo
            if (!resposta.ok || !data.sucesso) {

                mostrarAviso(
                    data.mensagem ||
                    "Erro ao excluir livro."
                );

                return;
            }

            // Volta para a imagem padrão
            carregarImagem(null);

            // Mostra mensagem
            mostrarAviso(
                "Excluído do Banco de Dados!"
            );
        }


        // Volta para o estado inicial
        visibilidadeDosBotoes(
            'inline',
            'none',
            'none',
            'none',
            'none'
        );

        // Limpa os campos
        limparAtributos();

        // Limpa o ISSN
        document.getElementById(
            "inputISSN_livro"
        ).value = "";

        // Libera o ISSN novamente
        document.getElementById(
            "inputISSN_livro"
        ).readOnly = false;

        // Atualiza a lista
        await listar();

    } catch (erro) {

        // Mostra erro no console
        console.error(
            "Erro ao salvar livro:",
            erro
        );

        // Mostra aviso
        mostrarAviso(
            "Erro ao efetuar operação no servidor."
        );
    }
}


// ======================================================
// LISTAR LIVROS
// ======================================================

async function listar() {

    try {

        // Busca os livros
        const resposta =
            await fetch(`${URL_API}/livro/listar`);

        // Converte para JSON
        const data = await resposta.json();

        // Verifica se deu certo
        if (data.sucesso) {

            // Cria o texto da lista
            let texto = "";

            // Percorre os livros
            for (let linha of data.livros) {

                // Mostra o autor
                const autor =
                    linha.id_autor
                        ? ` [Autor: ${linha.id_autor}]`
                        : "";

                // Monta a linha
                texto +=
                    `${linha.issn} - ${linha.nome_livro}` +
                    `${autor}` +
                    ` - Ano de publicação: ${linha.ano_publicacao}` +
                    `<br>`;
            }

            // Mostra a lista
            document.getElementById(
                "outputSaida"
            ).innerHTML =
                texto || "Nenhum livro cadastrado.";

        } else {

            // Mostra erro
            document.getElementById(
                "outputSaida"
            ).innerHTML =
                "Erro ao carregar livros.";
        }

    } catch (erro) {

        // Mostra erro no console
        console.error(
            "Erro ao listar livros:",
            erro
        );

        // Mostra mensagem
        document.getElementById(
            "outputSaida"
        ).innerHTML =
            "Servidor offline.";
    }
}


// ======================================================
// CANCELAR
// ======================================================

function cancelarOperacao() {

    // Limpa os campos
    limparAtributos();

    // Mostra a silhueta
    carregarImagem(null);

    // Libera o ISSN para uma nova pesquisa
    document.getElementById(
        "inputISSN_livro"
    ).readOnly = false;

    // Bloqueia os outros campos
    bloquearAtributos(true);

    // Mostra somente Procure
    visibilidadeDosBotoes(
        'inline',
        'none',
        'none',
        'none',
        'none'
    );

    // Mostra aviso
    mostrarAviso(
        "Operação cancelada."
    );
}


// ======================================================
// MOSTRAR AVISO
// ======================================================

function mostrarAviso(mensagem) {

    // Mostra a mensagem
    document.getElementById(
        "divAviso"
    ).innerHTML = mensagem;
}


// ======================================================
// MOSTRAR DADOS DO LIVRO
// ======================================================

function mostrarDadoslivro(p) {

    // Mostra o ISSN
    document.getElementById(
        "inputISSN_livro"
    ).value = p.issn;

    // Bloqueia o ISSN
    document.getElementById(
        "inputISSN_livro"
    ).readOnly = true;

    // Mostra o título
    document.getElementById(
        "inputNome_livro"
    ).value = p.nome_livro;

    // Seleciona o autor
    document.getElementById(
        "selectAutor"
    ).value = p.id_autor || "";

    // Seleciona a editora
    document.getElementById(
        "selectEditora"
    ).value = p.id_editora || "";

    // Mostra o ano
    document.getElementById(
        "inputAno_publicacao"
    ).value = p.ano_publicacao || "";

    // Bloqueia os campos
    bloquearAtributos(true);
}


// ======================================================
// LIMPAR CAMPOS
// ======================================================

function limparAtributos() {

    // Limpa o livro
    livro = null;

    // Limpa a operação
    oQueEstaFazendo = '';

    // Limpa o título
    document.getElementById(
        "inputNome_livro"
    ).value = "";

    // Limpa o autor
    document.getElementById(
        "selectAutor"
    ).value = "";

    // Limpa a editora
    document.getElementById(
        "selectEditora"
    ).value = "";

    // Limpa o ano
    document.getElementById(
        "inputAno_publicacao"
    ).value = "";

    // Limpa a imagem escolhida
    document.getElementById(
        "inputImagem"
    ).value = "";
}


// ======================================================
// BLOQUEAR ATRIBUTOS
// ======================================================

function bloquearAtributos(soLeitura) {

    // Campo título
    document.getElementById(
        "inputNome_livro"
    ).readOnly = soLeitura;

    // Campo autor
    document.getElementById(
        "selectAutor"
    ).disabled = soLeitura;

    // Campo editora
    document.getElementById(
        "selectEditora"
    ).disabled = soLeitura;

    // Campo ano
    document.getElementById(
        "inputAno_publicacao"
    ).readOnly = soLeitura;
}


// ======================================================
// VISIBILIDADE DOS BOTÕES
// ======================================================

function visibilidadeDosBotoes(
    btP,
    btI,
    btA,
    btE,
    btS
) {

    // Botão Procure
    document.getElementById(
        "btProcure"
    ).style.display = btP;

    // Botão Inserir
    document.getElementById(
        "btInserir"
    ).style.display = btI;

    // Botão Alterar
    document.getElementById(
        "btAlterar"
    ).style.display = btA;

    // Botão Excluir
    document.getElementById(
        "btExcluir"
    ).style.display = btE;

    // Botão Salvar
    document.getElementById(
        "btSalvar"
    ).style.display = btS;

    // Botão Cancelar
    document.getElementById(
        "btCancelar"
    ).style.display = btS;
}